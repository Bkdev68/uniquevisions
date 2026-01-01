import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Simple SMTP client using Deno's TCP connection
async function sendEmail(
  host: string,
  port: number,
  username: string,
  password: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // For port 465 (implicit TLS), we need to start with TLS
  const conn = await Deno.connectTls({
    hostname: host,
    port: port,
  });

  const read = async (): Promise<string> => {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    if (n === null) throw new Error("Connection closed");
    return decoder.decode(buffer.subarray(0, n));
  };

  const write = async (data: string): Promise<void> => {
    await conn.write(encoder.encode(data + "\r\n"));
  };

  try {
    // Read greeting
    let response = await read();
    console.log("Greeting:", response);

    // EHLO
    await write(`EHLO localhost`);
    response = await read();
    console.log("EHLO response:", response);

    // AUTH LOGIN
    await write("AUTH LOGIN");
    response = await read();
    console.log("AUTH response:", response);

    // Username (base64)
    await write(btoa(username));
    response = await read();
    console.log("Username response:", response);

    // Password (base64)
    await write(btoa(password));
    response = await read();
    console.log("Password response:", response);
    
    if (!response.startsWith("235")) {
      throw new Error("Authentication failed: " + response);
    }

    // MAIL FROM
    await write(`MAIL FROM:<${from}>`);
    response = await read();
    console.log("MAIL FROM response:", response);

    // RCPT TO
    await write(`RCPT TO:<${to}>`);
    response = await read();
    console.log("RCPT TO response:", response);

    // DATA
    await write("DATA");
    response = await read();
    console.log("DATA response:", response);

    // Build email with MIME multipart
    const boundary = "----=_Part_" + Date.now();
    const emailBody = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      `Content-Type: text/plain; charset=utf-8`,
      "",
      text || "",
      "",
      `--${boundary}`,
      `Content-Type: text/html; charset=utf-8`,
      "",
      html,
      "",
      `--${boundary}--`,
      ".",
    ].join("\r\n");

    await write(emailBody);
    response = await read();
    console.log("Email sent response:", response);

    if (!response.startsWith("250")) {
      throw new Error("Failed to send email: " + response);
    }

    // QUIT
    await write("QUIT");
    
  } finally {
    conn.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text }: EmailRequest = await req.json();
    
    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.strato.de";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || smtpUser;

    if (!smtpUser || !smtpPassword) {
      throw new Error("SMTP credentials not configured");
    }

    await sendEmail(
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromEmail!,
      to,
      subject,
      html,
      text
    );

    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
