import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sheet structure (row 1 headers):
// section | key | value_en | value_he
//
// Examples:
// hero | title | MOONLIGHT | MOONLIGHT
// footer | email | booking@... | booking@...
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    console.log("[fetch-content-sheet] API Key exists:", !!GOOGLE_API_KEY);
    console.log("[fetch-content-sheet] Sheet ID exists:", !!SHEET_ID);

    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables: GOOGLE_API_KEY / GOOGLE_SHEET_ID");
    }

    const SHEET_NAME = "Content";
    const RANGE = `${SHEET_NAME}!A2:D`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`;

    console.log("[fetch-content-sheet] Fetching:", RANGE);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[fetch-content-sheet] Google Sheets API error (${response.status}):`, errorText);
      throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rows: any[] = data.values || [];

    console.log("[fetch-content-sheet] Rows received:", rows.length);

    const out: Record<string, Record<string, { en: string; he: string }>> = {};

    for (const row of rows) {
      const section = (row?.[0] || "").toString().trim();
      const key = (row?.[1] || "").toString().trim();
      const valueEn = (row?.[2] ?? "").toString();
      const valueHe = (row?.[3] ?? "").toString();

      if (!section || !key) continue;

      if (!out[section]) out[section] = {};
      out[section][key] = { en: valueEn, he: valueHe };
    }

    return new Response(JSON.stringify({ content: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[fetch-content-sheet] Error:", error);
    return new Response(JSON.stringify({ error: (error as Error)?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
