import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://whitelineissig.me',
  'https://www.whitelineissig.me',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true"
  };
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Input validation limits
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

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
    console.log("Received contact form submission:", { name: data.name?.substring(0, 20), email: data.email?.substring(0, 30) });

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input lengths
    if (typeof data.name !== 'string' || data.name.length > MAX_NAME_LENGTH) {
      console.error("Name exceeds maximum length");
      return new Response(JSON.stringify({ error: "Name is too long (max 100 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof data.email !== 'string' || data.email.length > MAX_EMAIL_LENGTH) {
      console.error("Email exceeds maximum length");
      return new Response(JSON.stringify({ error: "Email is too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof data.subject !== 'string' || data.subject.length > MAX_SUBJECT_LENGTH) {
      console.error("Subject exceeds maximum length");
      return new Response(JSON.stringify({ error: "Subject is too long (max 200 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof data.message !== 'string' || data.message.length > MAX_MESSAGE_LENGTH) {
      console.error("Message exceeds maximum length");
      return new Response(JSON.stringify({ error: "Message is too long (max 5000 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error("Invalid email format");
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Zoho SMTP password from environment
    const zohoPassword = Deno.env.get("ZOHO_SMTP_PASSWORD");
    if (!zohoPassword) {
      console.error("ZOHO_SMTP_PASSWORD not configured");
      return new Response(JSON.stringify({ error: "Unable to send message. Please try again later." }), {
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
      .substring(0, MAX_NAME_LENGTH);

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
    const emailSubject = `Contact Form: ${data.subject.substring(0, MAX_SUBJECT_LENGTH)}`;
    const emailBody = `
Name: ${sanitizedName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message.substring(0, MAX_MESSAGE_LENGTH)}
    `.trim();

    const emailHtml = `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
<p><strong>Message:</strong></p>
<p>${escapeHtml(data.message.substring(0, MAX_MESSAGE_LENGTH)).replace(/\n/g, "<br>")}</p>
    `.trim();

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    console.log("Connecting to SMTP server...");
    
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
      console.log("SMTP connection established");

      if (!greeting.startsWith("220")) {
        console.error("Invalid SMTP greeting received");
        throw new Error("Email service unavailable");
      }

      // EHLO
      let response = await sendCommand(`EHLO whitelineissig.me`);

      if (!response.includes("250")) {
        console.error("EHLO command failed");
        throw new Error("Email service unavailable");
      }

      // AUTH LOGIN
      response = await sendCommand("AUTH LOGIN");

      if (!response.startsWith("334")) {
        console.error("AUTH LOGIN command failed");
        throw new Error("Email service unavailable");
      }

      // Send username (base64 encoded)
      response = await sendCommand(btoa(smtpUser));

      if (!response.startsWith("334")) {
        console.error("Username authentication step failed");
        throw new Error("Email service unavailable");
      }

      // Send password (base64 encoded)
      response = await sendCommand(btoa(zohoPassword));

      if (!response.startsWith("235")) {
        console.error("Password authentication failed");
        throw new Error("Email service unavailable");
      }

      console.log("Authentication successful");

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${smtpUser}>`);

      if (!response.startsWith("250")) {
        console.error("MAIL FROM command failed");
        throw new Error("Email service unavailable");
      }

      // RCPT TO
      response = await sendCommand(`RCPT TO:<${smtpUser}>`);

      if (!response.startsWith("250")) {
        console.error("RCPT TO command failed");
        throw new Error("Email service unavailable");
      }

      // DATA
      response = await sendCommand("DATA");

      if (!response.startsWith("354")) {
        console.error("DATA command failed");
        throw new Error("Email service unavailable");
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

      if (!response.startsWith("250")) {
        console.error("Message sending failed");
        throw new Error("Failed to send message");
      }

      // QUIT
      response = await sendCommand("QUIT");

      conn.close();

      console.log("Email sent successfully");
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
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again later." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);