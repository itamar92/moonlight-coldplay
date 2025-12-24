// Direct client-side fetching from public Google Sheets (no Supabase required)

export const GOOGLE_SHEET_ID = '1V0m-BhUqJvvCDGhdklUxKSxo2OOd2h1ZR1HiMLZ27mc';

// Convert Google Drive sharing links to direct display URLs
export function convertGoogleDriveUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') return url;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return undefined;
  
  // Match Google Drive file links: /file/d/FILE_ID/...
  const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Match Google Drive open links: ?id=FILE_ID
  const openMatch = trimmedUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    const fileId = openMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Return as-is if not a Google Drive link
  return trimmedUrl;
}

// Build CSV export URL for a specific sheet tab
function getSheetCsvUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Parse CSV text into rows (handles quoted fields with commas)
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  
  return rows;
}

// Fetch and parse a sheet tab
async function fetchSheet(sheetName: string): Promise<string[][]> {
  const url = getSheetCsvUrl(sheetName);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": ${response.status} ${response.statusText}`);
  }
  
  const csvText = await response.text();
  const rows = parseCsv(csvText);
  
  // Skip header row (first row)
  return rows.slice(1);
}

// ============ SHOWS (Coldplay tab) ============
// Columns: Date | Event Name | ? | Location | Ticket Link | Private | Image URL
export interface Show {
  id: string;
  date: string;
  venue: string;
  location: string;
  ticket_link: string;
  image_url?: string;
}

export async function fetchShows(): Promise<Show[]> {
  const rows = await fetchSheet('Coldplay');
  
  return rows
    .filter(row => {
      // Must have date, venue, location, ticket_link
      if (!row[0] || !row[1] || !row[3] || !row[4]) return false;
      // Filter out private events
      const isPrivate = (row[5] || '').toLowerCase() === 'true';
      return !isPrivate;
    })
    .map((row, index) => ({
      id: `show-${index + 1}`,
      date: row[0] || '',
      venue: row[1] || '',
      location: row[3] || '',
      ticket_link: row[4] || '#',
      image_url: convertGoogleDriveUrl(row[6]),
    }));
}

// ============ MEDIA (Media tab) ============
// Columns: type | url | thumbnail | title | description | duration | order
export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  duration?: string;
  order: number;
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const rows = await fetchSheet('Media');
  
  return rows
    .map((row, index) => {
      const type = (row[0] || '').toLowerCase();
      const rawUrl = row[1] || '';
      const rawThumbnail = row[2] || undefined;
      const title = row[3] || (type === 'video' ? 'Video' : 'Photo');
      const description = row[4] || undefined;
      const duration = row[5] || undefined;
      const orderRaw = row[6] || '';
      const order = parseInt(orderRaw, 10);
      
      // Convert Google Drive URLs for photos, keep video URLs as-is (YouTube)
      const url = type === 'photo' ? convertGoogleDriveUrl(rawUrl) || '' : rawUrl;
      const thumbnail = convertGoogleDriveUrl(rawThumbnail);
      
      return {
        id: `media-${index + 1}`,
        type: type === 'video' ? 'video' : 'photo',
        url,
        thumbnail,
        title,
        description,
        duration,
        order: Number.isFinite(order) ? order : index + 1,
      } as MediaItem;
    })
    .filter(item => item.url)
    .sort((a, b) => a.order - b.order);
}

// ============ TESTIMONIALS (Testimonials tab) ============
// Columns: author | role | content | avatar_url | order
export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar_url?: string;
  order: number;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const rows = await fetchSheet('Testimonials');
  
  return rows
    .filter(row => row[0] && row[2]) // Must have author and content
    .map((row, index) => ({
      id: `testimonial-${index + 1}`,
      author: row[0] || '',
      role: row[1] || '',
      content: row[2] || '',
      avatar_url: row[3] || undefined,
      order: parseInt(row[4], 10) || index + 1,
    }))
    .sort((a, b) => a.order - b.order);
}

// ============ CONTENT (Content tab) ============
// Columns: section | key | value_en | value_he
export interface ContentData {
  [section: string]: {
    [key: string]: {
      en: string;
      he: string;
    };
  };
}

export async function fetchContent(): Promise<ContentData> {
  const rows = await fetchSheet('Content');
  const content: ContentData = {};
  
  // Keys that contain URLs that might be Google Drive links
  const urlKeys = ['logo_url', 'image_url', 'background_url', 'thumbnail', 'avatar_url'];
  
  for (const row of rows) {
    const section = (row[0] || '').trim();
    const key = (row[1] || '').trim();
    let valueEn = row[2] ?? '';
    let valueHe = row[3] ?? '';
    
    if (!section || !key) continue;
    
    // Convert Google Drive URLs for URL-type keys
    if (urlKeys.includes(key)) {
      valueEn = convertGoogleDriveUrl(valueEn) || '';
      valueHe = convertGoogleDriveUrl(valueHe) || valueEn; // Fallback to English if Hebrew is empty
    }
    
    if (!content[section]) content[section] = {};
    content[section][key] = { en: valueEn, he: valueHe };
  }
  
  return content;
}

// ============ HEALTH CHECK ============
export async function testConnection(): Promise<{ success: boolean; error?: string; sheets?: string[] }> {
  try {
    // Try to fetch the Content sheet as a simple connectivity test
    const url = getSheetCsvUrl('Content');
    const response = await fetch(url);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const text = await response.text();
    const rows = parseCsv(text);
    
    return { 
      success: true, 
      sheets: ['Coldplay', 'Media', 'Testimonials', 'Content'],
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || 'Unknown error' 
    };
  }
}
