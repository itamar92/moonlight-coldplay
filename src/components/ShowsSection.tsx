
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
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
    return null;
  }
}

const ShowsSection = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchShows = async () => {
      try {
        console.log('Starting to fetch shows...');
        setLoading(true);
        setError(null);
        
        // Direct fetch from Supabase
        console.log('Fetching shows from Supabase...');
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('shows')
          .select('*')
          .eq('is_published', true);

        console.log('Supabase response:', { data: supabaseData, error: supabaseError });

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          // Continue to Google Sheets fallback
        } else if (supabaseData && supabaseData.length > 0) {
          console.log('Found shows in Supabase:', supabaseData.length);
          const processedShows = processShows(supabaseData);
          console.log('Processed shows (after filtering):', processedShows.length);
          setShows(processedShows);
          setLoading(false);
          return;
        }
        
        // Try Google Sheets fallback
        console.log('Trying Google Sheets fallback...');
        const { data: googleSheetsData, error: functionError } = await supabase.functions.invoke(
          'fetch-google-sheet'
        );

        console.log('Google Sheets response:', { data: googleSheetsData, error: functionError });

        if (functionError) {
          console.error('Google Sheets function error:', functionError);
          throw new Error('Failed to load shows from both sources');
        }
        
        if (googleSheetsData && googleSheetsData.shows && googleSheetsData.shows.length > 0) {
          console.log('Found shows in Google Sheets:', googleSheetsData.shows.length);
          const processedShows = processShows(googleSheetsData.shows);
          console.log('Processed Google Sheets shows (after filtering):', processedShows.length);
          setShows(processedShows);
        } else {
          console.log('No shows found in any source');
          setShows([]);
        }
      } catch (error: any) {
        console.error('Error fetching shows:', error);
        setError(error.message || 'Failed to load shows');
        setShows([]);
      } finally {
        console.log('Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchShows();
  }, [language]);

  // Helper function to process and filter shows
  const processShows = (rawShows: any[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    console.log('Current date for comparison:', now.toISOString());
    
    const futureShows = rawShows.filter(show => {
      const showDate = parseDateString(show.date);
      const isFuture = showDate && showDate >= now;
      console.log(`Show "${show.venue}" on ${show.date}: showDate=${showDate?.toISOString()}, isFuture=${isFuture}`);
      return isFuture;
    }).sort((a, b) => {
      const dateA = parseDateString(a.date);
      const dateB = parseDateString(b.date);
      
      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }
      
      return 0;
    });
    
    console.log('Future shows found:', futureShows.length);
    
    // If no future shows, let's also check for recent shows (last 30 days) for debugging
    if (futureShows.length === 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      const recentShows = rawShows.filter(show => {
        const showDate = parseDateString(show.date);
        const isRecent = showDate && showDate >= thirtyDaysAgo;
        console.log(`Recent check - Show "${show.venue}" on ${show.date}: showDate=${showDate?.toISOString()}, isRecent=${isRecent}`);
        return isRecent;
      });
      
      console.log('Recent shows (last 30 days):', recentShows.length);
    }
    
    return futureShows.slice(0, 6);
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseDateString(dateString);
      
      if (date && !isNaN(date.getTime())) {
        return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'he-IL', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Translations
  const texts = {
    upcomingShows: language === 'en' ? 'UPCOMING SHOWS' : 'הופעות קרובות',
    loading: language === 'en' ? 'Loading shows...' : 'טוען הופעות...',
    noShows: language === 'en' ? 'No upcoming shows scheduled.' : 'אין הופעות קרובות מתוכננות.',
    checkBack: language === 'en' ? 'Check back soon!' : 'בדקו שוב בקרוב!',
    getTickets: language === 'en' ? 'GET TICKETS' : 'לרכישת כרטיסים',
    viewAll: language === 'en' ? 'VIEW ALL SHOWS' : 'צפה בכל ההופעות',
    error: language === 'en' ? 'Error loading shows' : 'שגיאה בטעינת הופעות',
  };

  console.log('Render state:', { loading, error, showsCount: shows.length });

  if (loading) {
    return (
      <section id="shows" className="py-24 bg-band-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              {language === 'en' ? (
                <>UPCOMING <span className="text-band-purple">SHOWS</span></>
              ) : (
                <>הופעות <span className="text-band-purple">קרובות</span></>
              )}
            </h2>
            <div className="h-1 w-20 bg-band-purple mx-auto"></div>
          </div>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-white/70">{texts.loading}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="shows" className="py-24 bg-band-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              {language === 'en' ? (
                <>UPCOMING <span className="text-band-purple">SHOWS</span></>
              ) : (
                <>הופעות <span className="text-band-purple">קרובות</span></>
              )}
            </h2>
            <div className="h-1 w-20 bg-band-purple mx-auto"></div>
          </div>
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{texts.error}</p>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (shows.length === 0) {
    return (
      <section id="shows" className="py-24 bg-band-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              {language === 'en' ? (
                <>UPCOMING <span className="text-band-purple">SHOWS</span></>
              ) : (
                <>הופעות <span className="text-band-purple">קrובות</span></>
              )}
            </h2>
            <div className="h-1 w-20 bg-band-purple mx-auto"></div>
          </div>
          <div className="text-center py-16">
            <p className="text-white/70 text-lg mb-2">{texts.noShows}</p>
            <p className="text-white/70">{texts.checkBack}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shows" className="py-24 bg-band-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
            {language === 'en' ? (
              <>UPCOMING <span className="text-band-purple">SHOWS</span></>
            ) : (
              <>הופעות <span className="text-band-purple">קrובות</span></>
            )}
          </h2>
          <div className="h-1 w-20 bg-band-purple mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
        
        <div className="text-center">
          <Button 
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-band-dark transition-all"
            asChild
          >
            <Link to="/shows">
              {texts.viewAll}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowsSection;
