
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
    
    if (!GOOGLE_API_KEY || !SHEET_ID) {
      throw new Error("Missing required environment variables");
    }

    // Specify the sheet name and range (starting from row 2 to skip headers)
    const SHEET_NAME = "Coldplay"; 
    const RANGE = `${SHEET_NAME}!A2:F`;
    
    console.log(`Fetching data from sheet: ${SHEET_NAME}, range: ${RANGE}`);
    
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
    console.log(`Received data from Google Sheets: ${data.values?.length || 0} rows`);
    
    if (!data.values || data.values.length === 0) {
      return new Response(JSON.stringify({ shows: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Transform Google Sheets data to match our shows format
    // No longer filtering out past events, only filtering private events
    const shows = data.values
      .filter(row => {
        if (!row[0] || !row[1] || !row[3] || !row[4]) {
          return false; // Skip rows with missing essential data
        }
        
        // Filter out private events
        const isPrivate = (row[5] || "").toLowerCase() === "true";
        return !isPrivate;
      })
      .map((row) => ({
        date: row[0] || "",         // Date
        venue: row[1] || "",        // Event Name
        location: row[3] || "",     // Location
        ticket_link: row[4] || "#", // Links for tickets
        is_published: true
      }));

    console.log(`Filtered to ${shows.length} valid shows`);
    
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
