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

    // Sanitize inputs to prevent injection
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

    // Use SMTP via API (Zoho ZeptoMail API for transactional emails)
    // Since Deno doesn't have native SMTP, we'll use Zoho's ZeptoMail API or construct raw SMTP
    // For simplicity, let's use a base64 encoded auth and raw fetch to an SMTP relay endpoint
    
    // Alternative: Use raw SMTP connection via Deno
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    console.log("Connecting to Zoho SMTP server...");
    
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n ?? 0));
    };

    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    try {
      // Read initial greeting
      const greeting = await readResponse();
      console.log("SMTP Greeting:", greeting);

      // EHLO
      let response = await sendCommand(`EHLO whitelineissig.me`);
      console.log("EHLO response:", response);

      // AUTH LOGIN
      response = await sendCommand("AUTH LOGIN");
      console.log("AUTH LOGIN response:", response);

      // Send username (base64 encoded)
      response = await sendCommand(btoa(smtpUser));
      console.log("Username response:", response);

      // Send password (base64 encoded)
      response = await sendCommand(btoa(zohoPassword));
      console.log("Password response:", response.substring(0, 20) + "...");

      if (!response.startsWith("235")) {
        throw new Error("Authentication failed: " + response);
      }

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${smtpUser}>`);
      console.log("MAIL FROM response:", response);

      // RCPT TO (send to ourselves)
      response = await sendCommand(`RCPT TO:<${smtpUser}>`);
      console.log("RCPT TO response:", response);

      // DATA
      response = await sendCommand("DATA");
      console.log("DATA response:", response);

      // Construct email headers and body
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
        `.`,
      ].join("\r\n");

      response = await sendCommand(emailMessage);
      console.log("Message response:", response);

      // QUIT
      response = await sendCommand("QUIT");
      console.log("QUIT response:", response);

      conn.close();

      console.log("Email sent successfully!");
      return new Response(JSON.stringify({ message: "Email sent successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (smtpError) {
      console.error("SMTP Error:", smtpError);
      conn.close();
      throw smtpError;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again later." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
