/**
 * Supabase Edge Function: Send Email
 * Triggered on form submissions to send notification emails
 *
 * Usage: Called from the application when user submits form
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  template?: string;
}

export default async (req: Request) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { to, subject, message, template } = (await req.json()) as EmailRequest;

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert email record in database for tracking
    const { data, error } = await supabase.from("emails").insert({
      recipient: to,
      subject,
      body: message,
      template_name: template,
      sent_at: new Date().toISOString(),
      status: "pending",
    });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send actual email (integrate with email service like SendGrid, Resend, etc.)
    // Example implementation:
    // const emailResponse = await sendEmailViaProvider(to, subject, message);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email queued for sending",
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
