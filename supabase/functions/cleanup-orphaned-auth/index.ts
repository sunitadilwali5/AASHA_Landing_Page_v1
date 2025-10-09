import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, countryCode } = await req.json();

    if (!phoneNumber || !countryCode) {
      return new Response(
        JSON.stringify({ error: "Phone number and country code are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = `${phoneNumber}@aasha-temp.com`;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", phoneNumber)
      .eq("country_code", countryCode)
      .maybeSingle();

    if (profile) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "User already has a complete registration",
          hasProfile: true
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: authUser, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      throw getUserError;
    }

    const userToDelete = authUser.users.find(u => u.email === email);

    if (!userToDelete) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No orphaned auth user found",
          cleaned: false
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userToDelete.id
    );

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Orphaned auth user cleaned up successfully",
        cleaned: true
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in cleanup-orphaned-auth:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to cleanup orphaned auth user",
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});