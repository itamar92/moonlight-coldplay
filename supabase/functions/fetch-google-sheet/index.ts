
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
    // Get Google Sheets API key and sheet ID from environment variables
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
    
    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables");
    }

    // Sheet range (assuming shows data is in Sheet1 from A2:E)
    const RANGE = "Sheet1!A2:E";
    
    // Fetch data from Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Sheets API error: ${error}`);
    }

    const data = await response.json();
    
    // Transform Google Sheets data to match our shows format
    const shows = data.values.map((row: string[]) => ({
      date: row[0] || "",
      venue: row[1] || "",
      location: row[2] || "",
      ticket_link: row[3] || "#",
      is_published: true
    }));

    return new Response(JSON.stringify({ shows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
