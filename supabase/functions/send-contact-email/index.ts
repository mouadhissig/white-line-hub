import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const data: ContactFormData = await req.json();
    console.log("Received contact form submission:", { name: data.name, email: data.email, subject: data.subject });

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error("Invalid email format:", data.email);
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Zoho SMTP password from environment
    const zohoPassword = Deno.env.get("ZOHO_SMTP_PASSWORD");
    if (!zohoPassword) {
      console.error("ZOHO_SMTP_PASSWORD not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Zoho Mail SMTP settings
    const smtpHost = "smtp.zoho.com";
    const smtpPort = 465;
    const smtpUser = "contact@whitelineissig.me";

    // Sanitize inputs
    const sanitizedName = data.name
      .replace(/[\r\n\t\x00-\x1F\x7F]/g, "")
      .replace(/[\\"]/g, "\\$&")
      .trim()
      .substring(0, 100);

    const escapeHtml = (text: string) => {
      const map: { [key: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    // Create email content
    const emailSubject = `Contact Form: ${data.subject}`;
    const emailBody = `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
    `.trim();

    const emailHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
    `.trim();

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    console.log("Connecting to Zoho SMTP server...");
    
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    // Read full response including multi-line responses
    const readFullResponse = async (): Promise<string> => {
      let fullResponse = "";
      const buffer = new Uint8Array(4096);
      
      while (true) {
        const n = await conn.read(buffer);
        if (n === null) break;
        
        const chunk = decoder.decode(buffer.subarray(0, n));
        fullResponse += chunk;
        
        // Check if we have a complete response (ends with \r\n and code followed by space)
        const lines = fullResponse.trim().split("\r\n");
        const lastLine = lines[lines.length - 1];
        // Response is complete if last line has code followed by space (not hyphen)
        if (lastLine.length >= 4 && lastLine[3] === " ") {
          break;
        }
        // Also break on single 3-digit responses
        if (lastLine.length >= 3 && /^\d{3}/.test(lastLine) && !lastLine.includes("-")) {
          break;
        }
      }
      
      return fullResponse;
    };

    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + "\r\n"));
      // Small delay to ensure response is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      return await readFullResponse();
    };

    try {
      // Read initial greeting
      const greeting = await readFullResponse();
      console.log("SMTP Greeting:", greeting.trim());

      if (!greeting.startsWith("220")) {
        throw new Error("Invalid SMTP greeting: " + greeting);
      }

      // EHLO
      let response = await sendCommand(`EHLO whitelineissig.me`);
      console.log("EHLO response:", response.trim());

      if (!response.includes("250")) {
        throw new Error("EHLO failed: " + response);
      }

      // AUTH LOGIN
      response = await sendCommand("AUTH LOGIN");
      console.log("AUTH LOGIN response:", response.trim());

      if (!response.startsWith("334")) {
        throw new Error("AUTH LOGIN failed: " + response);
      }

      // Send username (base64 encoded)
      response = await sendCommand(btoa(smtpUser));
      console.log("Username sent, response:", response.trim());

      if (!response.startsWith("334")) {
        throw new Error("Username rejected: " + response);
      }

      // Send password (base64 encoded)
      response = await sendCommand(btoa(zohoPassword));
      console.log("Password sent, response code:", response.substring(0, 3));

      if (!response.startsWith("235")) {
        // 535 = auth failed, 334 = still waiting (shouldn't happen)
        throw new Error("Authentication failed. Please check your Zoho password or generate an App Password in Zoho Mail settings.");
      }

      console.log("Authentication successful!");

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${smtpUser}>`);
      console.log("MAIL FROM response:", response.trim());

      if (!response.startsWith("250")) {
        throw new Error("MAIL FROM failed: " + response);
      }

      // RCPT TO
      response = await sendCommand(`RCPT TO:<${smtpUser}>`);
      console.log("RCPT TO response:", response.trim());

      if (!response.startsWith("250")) {
        throw new Error("RCPT TO failed: " + response);
      }

      // DATA
      response = await sendCommand("DATA");
      console.log("DATA response:", response.trim());

      if (!response.startsWith("354")) {
        throw new Error("DATA failed: " + response);
      }

      // Construct email message
      const emailMessage = [
        `From: "${sanitizedName}" <${smtpUser}>`,
        `To: ${smtpUser}`,
        `Reply-To: ${data.email}`,
        `Subject: ${emailSubject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="boundary123"`,
        ``,
        `--boundary123`,
        `Content-Type: text/plain; charset="UTF-8"`,
        ``,
        emailBody,
        ``,
        `--boundary123`,
        `Content-Type: text/html; charset="UTF-8"`,
        ``,
        emailHtml,
        ``,
        `--boundary123--`,
      ].join("\r\n");

      // Send email content and end with .
      await conn.write(encoder.encode(emailMessage + "\r\n.\r\n"));
      await new Promise(resolve => setTimeout(resolve, 200));
      response = await readFullResponse();
      console.log("Message sent, response:", response.trim());

      if (!response.startsWith("250")) {
        throw new Error("Message sending failed: " + response);
      }

      // QUIT
      response = await sendCommand("QUIT");
      console.log("QUIT response:", response.trim());

      conn.close();

      console.log("Email sent successfully!");
      return new Response(JSON.stringify({ message: "Email sent successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (smtpError) {
      console.error("SMTP Error:", smtpError);
      try { conn.close(); } catch {}
      throw smtpError;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
