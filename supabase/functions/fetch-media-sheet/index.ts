import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sheet structure (row 1 headers):
// type | url | thumbnail | title | description | duration | order
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    console.log("[fetch-media-sheet] API Key exists:", !!GOOGLE_API_KEY);
    console.log("[fetch-media-sheet] Sheet ID exists:", !!SHEET_ID);

    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables: GOOGLE_API_KEY / GOOGLE_SHEET_ID");
    }

    const SHEET_NAME = "Media";
    const RANGE = `${SHEET_NAME}!A2:G`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`;

    console.log("[fetch-media-sheet] Fetching:", RANGE);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[fetch-media-sheet] Google Sheets API error (${response.status}):`, errorText);
      throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const rows: any[] = data.values || [];

    console.log("[fetch-media-sheet] Rows received:", rows.length);

    const media = rows
      .map((row, index) => {
        const type = (row?.[0] || "").toString().trim().toLowerCase();
        const url = (row?.[1] || "").toString().trim();
        const thumbnail = (row?.[2] || "").toString().trim();
        const title = (row?.[3] || "").toString().trim();
        const description = (row?.[4] || "").toString().trim();
        const duration = (row?.[5] || "").toString().trim();
        const orderRaw = (row?.[6] || "").toString().trim();

        const order = Number.parseInt(orderRaw, 10);

        return {
          id: `sheet-${index + 1}`,
          type: type === "video" ? "video" : "photo",
          url,
          thumbnail: thumbnail || undefined,
          title: title || (type === "video" ? "Video" : "Photo"),
          description: description || undefined,
          duration: duration || undefined,
          order: Number.isFinite(order) ? order : index + 1,
        };
      })
      .filter((item) => item.url)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return new Response(JSON.stringify({ media }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[fetch-media-sheet] Error:", error);
    return new Response(JSON.stringify({ error: (error as Error)?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
