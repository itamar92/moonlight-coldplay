
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface Show {
  id: string;
  date: string;
  venue: string;
  location: string;
  ticket_link: string;
}

// Parse a date string in dd/MM/yyyy format to a Date object
function parseDateString(dateString: string): Date | null {
  try {
    if (!dateString) return null;
    
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      if (!day || !month || !year) return null;
      
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

const AllShows = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "ALL SHOWS",
      loading: "Loading shows...",
      noShows: "No shows scheduled at the moment.",
      checkBack: "Check back soon!",
      getTickets: "GET TICKETS"
    },
    he: {
      title: "כל ההופעות",
      loading: "טוען הופעות...",
      noShows: "אין הופעות מתוכננות כרגע.",
      checkBack: "בדקו שוב בקרוב!",
      getTickets: "הזמינו כרטיסים"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchShows = async () => {
      try {
        console.log("AllShows: Fetching shows data...");
        // First try to get shows from Supabase
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('shows')
          .select('*')
          .eq('is_published', true)
          .order('date', { ascending: true });

        if (supabaseError) {
          console.error('AllShows: Supabase error:', supabaseError);
          throw supabaseError;
        }
        
        // If we have data in Supabase, use that
        if (supabaseData && supabaseData.length > 0) {
          console.log("AllShows: Using Supabase shows data:", supabaseData);
          setShows(supabaseData);
          setLoading(false);
          return;
        }
        
        // If no data in Supabase, try to fetch from Google Sheets
        console.log("AllShows: No Supabase data, trying Google Sheets...");
        const response = await supabase.functions.invoke(
          'fetch-google-sheet'
        );

        if (response.error) {
          console.error('AllShows: Function error:', response.error);
          throw response.error;
        }

        const googleSheetsData = response.data;
        
        if (googleSheetsData && googleSheetsData.shows && googleSheetsData.shows.length > 0) {
          console.log("AllShows: Using Google Sheets data:", googleSheetsData.shows);
          setShows(googleSheetsData.shows);
        } else {
          console.log("AllShows: No shows data found in Google Sheets");
          // No shows found in either Supabase or Google Sheets
          setShows([]);
        }
      } catch (error: any) {
        console.error('AllShows: Error fetching shows:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching shows',
          description: error.message || "Couldn't load shows. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [toast]);

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      // Parse the date using our custom function for dd/MM/yyyy format
      const date = parseDateString(dateString);
      
      if (date && !isNaN(date.getTime())) {
        return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'he-IL', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
      return dateString; // Fall back to original string if parsing fails
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Return original date string in case of error
    }
  };

  return (
    <div className={`min-h-screen bg-band-dark text-white ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white mr-4" size="icon">
              <ArrowLeft className={`h-5 w-5 ${language === 'he' ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-glow">
            {language === 'en' ? (
              <><span className="text-white">ALL</span> <span className="text-band-purple">SHOWS</span></>
            ) : (
              <span className="text-band-purple">{t.title}</span>
            )}
          </h1>
        </div>
        
        <div className="h-1 w-20 bg-band-purple mb-8"></div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-white/70">{t.loading}</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70">{t.noShows}</p>
            <p className="text-white/70 mt-2">{t.checkBack}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show, index) => (
              <Card key={show.id || index} className="bg-black/50 border-band-purple/20 backdrop-blur-sm overflow-hidden group hover:border-band-purple transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4 text-band-purple">
                    <Calendar size={18} className="mr-2" />
                    <span className="text-sm font-medium">{formatDate(show.date)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{show.venue}</h3>
                  <div className="flex items-center mb-6 text-white/70">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{show.location}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-band-purple text-band-purple hover:bg-band-purple hover:text-white transition-all"
                    asChild
                  >
                    <a href={show.ticket_link} target="_blank" rel="noopener noreferrer">
                      {t.getTickets}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllShows;
