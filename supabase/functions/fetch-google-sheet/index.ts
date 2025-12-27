
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse a date string in dd/MM/yyyy format to a Date object
function parseDateString(dateString: string): Date | null {
  try {
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const parsedDate = new Date(`${year}-${month}-${day}`);
      
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Fallback to standard date parsing
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (e) {
    console.error('Error parsing date:', dateString, e);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Google Sheets API key and sheet ID from environment variables
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
    
    console.log("API Key exists:", !!GOOGLE_API_KEY);
    console.log("Sheet ID exists:", !!SHEET_ID);
    
    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables");
    }

    // Specify the sheet name and range (starting from row 2 to skip headers)
    // Updated range to include column G for image URLs
    const SHEET_NAME = "Coldplay"; 
    const RANGE = `${SHEET_NAME}!A2:G`;
    
    console.log(`Fetching data from sheet: ${SHEET_NAME}, range: ${RANGE}`);
    
    // Fetch data from Google Sheets
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${GOOGLE_API_KEY}`;
    console.log("Fetching from URL:", url);
    
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Sheets API error (${response.status}):`, errorText);
      throw new Error(`Google Sheets API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received data from Google Sheets: ${data.values?.length || 0} rows`);
    
    if (!data.values || data.values.length === 0) {
      console.log("No data rows found in sheet");
      return new Response(JSON.stringify({ shows: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Transform Google Sheets data to match our shows format
    // Only filter out private events, NOT past events - let the frontend handle date filtering
    const shows = data.values
      .filter((row: string[]) => {
        // Log each row for debugging
        console.log("Processing row:", JSON.stringify(row));
        
        if (!row[0] || !row[1] || !row[3] || !row[4]) {
          console.log("Skipping row due to missing essential data");
          return false; // Skip rows with missing essential data
        }
        
        // Only filter out private events - DO NOT filter by date here
        const isPrivate = (row[5] || "").toLowerCase() === "true";
        if (isPrivate) {
          console.log("Skipping private event");
        }
        return !isPrivate;
      })
      .map((row: string[]) => ({
        date: row[0] || "",              // Date
        venue: row[1] || "",             // Event Name
        location: row[3] || "",          // Location
        ticket_link: row[4] || "#",      // Links for tickets
        image_url: row[6] || "",         // Image URL (new column G)
        is_published: true
      }));

    console.log(`Filtered to ${shows.length} valid shows (including all dates)`);
    console.log("Final shows data:", JSON.stringify(shows));
    
    return new Response(JSON.stringify({ shows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching Google Sheets data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
