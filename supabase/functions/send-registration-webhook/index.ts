import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegistrationData {
  userId: string;
  profileId: string;
  elderlyProfileId: string;
  registrationType: string;
  phoneNumber: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  language: string;
  maritalStatus: string;
  callTimePreference: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    time: string;
  }>;
  interests: string[];
  lovedOne?: {
    phoneNumber: string;
    countryCode: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    language: string;
    maritalStatus: string;
    relationship: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const registrationData: RegistrationData = await req.json();

    const webhookUrl = "https://baibhavparida2.app.n8n.cloud/webhook-test/Initiate_call";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      console.error("Webhook failed:", await response.text());
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    const result = await response.json().catch(() => ({ success: true }));

    return new Response(
      JSON.stringify({ success: true, webhookResponse: result }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-registration-webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send webhook" 
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
