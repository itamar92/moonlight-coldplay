import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
    
    console.log("API Key exists:", !!GOOGLE_API_KEY);
    console.log("Sheet ID exists:", !!SHEET_ID);
    
    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables");
    }

    // Sheet structure: author | role | content | avatar_url | order
    const SHEET_NAME = "Testimonials";
    const RANGE = `${SHEET_NAME}!A2:E`;
    
    console.log(`Fetching testimonials from sheet: ${SHEET_NAME}`);
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Sheets API error (${response.status}):`, errorText);
      throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received ${data.values?.length || 0} testimonial rows`);
    
    if (!data.values || data.values.length === 0) {
      return new Response(JSON.stringify({ testimonials: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Transform to testimonials format
    interface Testimonial {
      id: string;
      author: string;
      role: string;
      content: string;
      avatar_url: string;
      order: number;
    }
    
    const testimonials: Testimonial[] = data.values
      .filter((row: string[]) => row[0] && row[2]) // Must have author and content
      .map((row: string[], index: number) => ({
        id: `sheet-${index + 1}`,
        author: row[0] || "",
        role: row[1] || "",
        content: row[2] || "",
        avatar_url: row[3] || "",
        order: parseInt(row[4]) || index + 1
      }))
      .sort((a: Testimonial, b: Testimonial) => a.order - b.order);

    console.log(`Processed ${testimonials.length} testimonials`);
    
    return new Response(JSON.stringify({ testimonials }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching testimonials:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
