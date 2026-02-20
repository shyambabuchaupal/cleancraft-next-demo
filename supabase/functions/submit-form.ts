/**
 * Supabase Edge Function: Submit Form
 * Handles form submissions from the client application
 * Saves data to database and triggers notifications
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface FormSubmission {
  form_type: "franchise" | "course" | "contact";
  name: string;
  email: string;
  phone: string;
  message?: string;
  [key: string]: any;
}

export default async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const formData = (await req.json()) as FormSubmission;

    // Validate required fields
    const required = ["form_type", "name", "email", "phone"];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          fields: missing,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert form submission into database
    const { data, error } = await supabase
      .from(`${formData.form_type}_submissions`)
      .insert({
        ...formData,
        submitted_at: new Date().toISOString(),
        ip_address: req.headers.get("cf-connecting-ip") || "unknown",
        user_agent: req.headers.get("user-agent"),
        status: "new",
      });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to submit form",
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send notification email
    await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: formData.email,
          subject: `Thank you for your ${formData.form_type} submission`,
          message: `We've received your submission and will get back to you soon.`,
          template: `${formData.form_type}_confirmation`,
        }),
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Form submitted successfully",
        id: data?.[0]?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};
