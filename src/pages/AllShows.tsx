
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
  image_url?: string;
}

// Parse a date string in dd/MM/yyyy or dd/MM/yy format to a Date object
function parseDateString(dateString: string): Date | null {
  try {
    const trimmed = dateString?.trim();
    if (!trimmed) return null;

    if (trimmed.includes('/')) {
      const [dayRaw, monthRaw, yearRaw] = trimmed.split('/');
      const day = dayRaw?.padStart(2, '0');
      const month = monthRaw?.padStart(2, '0');
      const year = yearRaw?.length === 2 ? `20${yearRaw}` : yearRaw;

      const parsedDate = new Date(`${year}-${month}-${day}`);
      return !isNaN(parsedDate.getTime()) ? parsedDate : null;
    }

    const date = new Date(trimmed);
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

  useEffect(() => {
    const fetchShows = async () => {
      try {
        // Google Sheets is now the source of truth for shows
        const { data: googleSheetsData, error: functionError } = await supabase.functions.invoke(
          'fetch-google-sheet'
        );

        if (functionError) throw functionError;

        const rawShows = googleSheetsData?.shows ?? [];
        const sortedShows = rawShows.sort((a: any, b: any) => {
          const dateA = parseDateString(a.date);
          const dateB = parseDateString(b.date);

          if (dateA && dateB) return dateA.getTime() - dateB.getTime();
          return 0;
        });

        setShows(sortedShows);
      } catch (error: any) {
        console.error('Error fetching shows:', error);
        toast({
          variant: 'destructive',
          title: language === 'en' ? 'Error fetching shows' : 'שגיאה בטעינת הופעות',
          description: language === 'en'
            ? "Couldn't load shows. Please try again later."
            : "לא ניתן לטעון הופעות. אנא נסה שוב מאוחר יותר.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [language]);

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
      return dateString; // Return original date string in case of error
    }
  };

  // Translations
  const texts = {
    allShows: language === 'en' ? 'ALL SHOWS' : 'כל ההופעות',
    loading: language === 'en' ? 'Loading shows...' : 'טוען הופעות...',
    noShows: language === 'en' ? 'No shows scheduled at the moment.' : 'אין הופעות מתוכננות כרגע.',
    checkBack: language === 'en' ? 'Check back soon!' : 'בדקו שוב בקרוב!',
    getTickets: language === 'en' ? 'GET TICKETS' : 'לרכישת כרטיסים',
  };

  return (
    <div className="min-h-screen bg-band-dark text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white mr-4" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-glow">
            {language === 'en' ? (
              <>ALL <span className="text-band-purple">SHOWS</span></>
            ) : (
              <>כל <span className="text-band-purple">ההופעות</span></>
            )}
          </h1>
        </div>
        
        <div className="h-1 w-20 bg-band-purple mb-8"></div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-white/70">{texts.loading}</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70">{texts.noShows}</p>
            <p className="text-white/70 mt-2">{texts.checkBack}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show, index) => (
              <Card key={show.id || index} className="bg-black/50 border-band-purple/20 backdrop-blur-sm overflow-hidden group hover:border-band-purple transition-colors">
                {show.image_url && (
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={show.image_url} 
                      alt={show.venue} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
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
                      {texts.getTickets}
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
