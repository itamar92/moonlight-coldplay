import React, { useEffect, useState } from 'react';
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
    console.error('Error parsing date:', dateString, e);
    return null;
  }
}

const ShowsSection = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        console.log('Fetching shows data...');
        
        // First try to get shows from Supabase
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('shows')
          .select('*')
          .eq('is_published', true)
          .order('date', { ascending: true });

        if (supabaseError) {
          console.error('Error fetching shows:', supabaseError);
          throw supabaseError;
        }
        
        console.log('Shows data received:', supabaseData);
        
        // If we have data in Supabase, use that
        if (supabaseData && supabaseData.length > 0) {
          setShows(supabaseData.slice(0, 4)); // Only show the first 4 shows in the homepage section
        } else {
          console.log('No shows found in database');
          // No shows found
          setShows([]);
        }
      } catch (error: any) {
        console.error('Error fetching shows:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching shows',
          description: "Couldn't load upcoming shows. Please try again later.",
        });
        setShows([]);
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
      return dateString; // Return original date string in case of error
    }
  };

  // Translations
  const texts = {
    upcomingShows: language === 'en' ? 'UPCOMING SHOWS' : 'הופעות קרובות',
    description: language === 'en' 
      ? "Don't miss your chance to experience the magic of Moonlight's music live. Check our tour schedule and grab your tickets before they're gone!"
      : "אל תחמיצו את ההזדמנות לחוות את הקסם של המוזיקה של Moonlight בהופעה חיה. בדקו את לוח ההופעות שלנו והשיגו כרטיסים לפני שייגמרו!",
    loading: language === 'en' ? 'Loading upcoming shows...' : 'טוען הופעות קרובות...',
    noShows: language === 'en' ? 'No upcoming shows scheduled at the moment.' : 'אין הופעות קרובות מתוכננות כרגע.',
    checkBack: language === 'en' ? 'Check back soon!' : 'בדקו שוב בקרוב!',
    getTickets: language === 'en' ? 'GET TICKETS' : 'לרכישת כרטיסים',
    contactBookings: language === 'en' ? 'CONTACT FOR BOOKINGS' : 'צרו קשר להזמנות',
    viewAllShows: language === 'en' ? 'VIEW ALL SHOWS' : 'צפו בכל ההופעות'
  };

  return (
    <section id="shows" className="py-20 bg-gradient-to-b from-band-dark to-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cosmic"></div>
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-band-purple/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            {texts.upcomingShows.split(' ')[0]} <span className="text-band-purple">{texts.upcomingShows.split(' ')[1]}</span>
          </h2>
          <div className="h-1 w-20 bg-band-purple mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            {texts.description}
          </p>
        </div>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        <div className="text-center mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-band-blue text-band-blue hover:bg-band-blue/10 glow-blue"
            asChild
          >
            <a href="#contact">
              {texts.contactBookings}
            </a>
          </Button>
          
          <Button 
            size="lg" 
            variant="default" 
            className="bg-band-purple hover:bg-band-purple/90 text-white glow-purple"
            asChild
          >
            <Link to="/shows">
              {texts.viewAllShows}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowsSection;
