
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar_url?: string;
  order: number;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchTestimonials = async () => {
      console.log('🔍 TestimonialsSection: Starting fetch...');
      
      try {
        // Add a timeout to the query
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
        );

        const queryPromise = supabase
          .from('testimonials')
          .select('*')
          .order('order', { ascending: true });

        const { data, error: supabaseError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        console.log('✅ TestimonialsSection: Query completed');
        
        if (supabaseError) {
          console.error('❌ TestimonialsSection: Error:', supabaseError.message);
          setError(supabaseError.message);
          // Use fallback data
          const fallbackData = [
            {
              id: 'fallback-1',
              author: language === 'en' ? 'Music Fan' : 'אוהב מוזיקה',
              role: language === 'en' ? 'Concert Goer' : 'צופה קונצרטים',
              content: language === 'en' 
                ? "Amazing performance! They really captured the essence of Coldplay's music."
                : "הופעה מדהימה! הם באמת תפסו את המהות של המוזיקה של קולדפליי.",
              order: 1
            },
            {
              id: 'fallback-2',
              author: language === 'en' ? 'Event Organizer' : 'מארגן אירועים',
              role: language === 'en' ? 'Venue Manager' : 'מנהל מקום',
              content: language === 'en'
                ? "Professional, talented, and truly entertaining. Highly recommended!"
                : "מקצועיים, מוכשרים ובאמת משעשעים. מומלץ בחום!",
              order: 2
            }
          ];
          setTestimonials(fallbackData);
        } else if (data && data.length > 0) {
          console.log('📊 TestimonialsSection: Found', data.length, 'testimonials');
          setTestimonials(data);
        } else {
          console.log('📭 TestimonialsSection: No data, using fallback');
          // Use fallback data when no testimonials exist
          const fallbackData = [
            {
              id: 'fallback-1',
              author: language === 'en' ? 'Music Fan' : 'אוהב מוזיקה',
              role: language === 'en' ? 'Concert Goer' : 'צופה קונצרטים',
              content: language === 'en' 
                ? "Amazing performance! They really captured the essence of Coldplay's music."
                : "הופעה מדהימה! הם באמת תפסו את המהות של המוזיקה של קולדפליי.",
              order: 1
            },
            {
              id: 'fallback-2',
              author: language === 'en' ? 'Event Organizer' : 'מארגן אירועים',
              role: language === 'en' ? 'Venue Manager' : 'מנהל מקום',
              content: language === 'en'
                ? "Professional, talented, and truly entertaining. Highly recommended!"
                : "מקצועיים, מוכשרים ובאמת משעשעים. מומלץ בחום!",
              order: 2
            }
          ];
          setTestimonials(fallbackData);
        }
      } catch (error) {
        console.error('💥 TestimonialsSection: Exception:', error instanceof Error ? error.message : 'Unknown error');
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setTestimonials([]);
      } finally {
        console.log('🏁 TestimonialsSection: Setting loading to false');
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [language]);

  const texts = {
    whatPeopleSay: language === 'en' ? 'WHAT PEOPLE SAY' : 'מה אנשים אומרים',
    loading: language === 'en' ? 'Loading testimonials...' : 'טוען המלצות...',
    noTestimonials: language === 'en' ? 'No testimonials available.' : 'אין המלצות זמינות.',
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-band-dark to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              {language === 'en' ? (
                <>WHAT PEOPLE <span className="text-band-purple">SAY</span></>
              ) : (
                <>מה אנשים <span className="text-band-purple">אומרים</span></>
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
      <section className="py-24 bg-gradient-to-b from-band-dark to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
              {language === 'en' ? (
                <>WHAT PEOPLE <span className="text-band-purple">SAY</span></>
              ) : (
                <>מה אנשים <span className="text-band-purple">אומרים</span></>
              )}
            </h2>
            <div className="h-1 w-20 bg-band-purple mx-auto"></div>
          </div>
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">Error loading testimonials</p>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-band-dark to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
            {language === 'en' ? (
              <>WHAT PEOPLE <span className="text-band-purple">SAY</span></>
            ) : (
              <>מה אנשים <span className="text-band-purple">אומרים</span></>
            )}
          </h2>
          <div className="h-1 w-20 bg-band-purple mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-black/50 border-band-purple/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="text-band-purple mr-2" size={24} />
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                </div>
                <p className="text-white/80 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  {testimonial.avatar_url && (
                    <img 
                      src={testimonial.avatar_url} 
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                  )}
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-band-purple text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
