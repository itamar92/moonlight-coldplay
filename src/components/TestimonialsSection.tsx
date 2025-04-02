
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface Testimonial {
  id: string;
  author: string;
  role?: string;
  location?: string;
  rating: number;
  content: string;
  avatar_url?: string;
}

// Define the database testimonial type
interface DbTestimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  order: number;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('order', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform database testimonials to match our Testimonial interface
          const mappedTestimonials: Testimonial[] = data.map((item: DbTestimonial) => ({
            id: item.id,
            author: item.author,
            role: item.role,
            location: item.role, // Use role as location
            content: item.content,
            avatar_url: item.avatar_url,
            rating: 5 // Add default rating
          }));
          
          setTestimonials(mappedTestimonials);
        } else {
          // Fallback to sample testimonials if none in database
          setTestimonials([
            {
              id: '1',
              author: language === 'en' ? 'Sarah Johnson' : 'שרה יוהנסון',
              location: language === 'en' ? 'Los Angeles, CA' : 'לוס אנג\'לס, קליפורניה',
              rating: 5,
              content: language === 'en' 
                ? "Absolutely amazing! I've seen Coldplay live, and these guys capture their energy and sound perfectly. Can't wait for their next show!"
                : "פשוט מדהים! ראיתי את קולדפליי בהופעה חיה, והחבר'ה האלה מצליחים לתפוס את האנרגיה והצליל שלהם בצורה מושלמת. לא יכולה לחכות להופעה הבאה שלהם!"
            },
            {
              id: '2',
              author: language === 'en' ? 'Michael Chen' : 'מייקל צ\'ן',
              location: language === 'en' ? 'Boston, MA' : 'בוסטון, מסצ\'וסטס',
              rating: 5,
              content: language === 'en'
                ? "Moonlight brings the magic of Coldplay to life in a way that feels both authentic and fresh. Their rendition of 'Fix You' had me in tears."
                : "מונלייט מביאים את הקסם של קולדפליי לחיים בדרך שמרגישה אותנטית ורעננה כאחד. הביצוע שלהם ל-'Fix You' הביא אותי לדמעות."
            },
            {
              id: '3',
              author: language === 'en' ? 'Jessica Williams' : 'ג\'סיקה וויליאמס',
              location: language === 'en' ? 'Austin, TX' : 'אוסטין, טקסס',
              rating: 5,
              content: language === 'en'
                ? "I've been to three of their shows already, and each one has been better than the last. Their passion for the music shines through in every performance."
                : "הייתי כבר בשלוש הופעות שלהם, וכל אחת הייתה טובה יותר מהקודמת. התשוקה שלהם למוזיקה ניכרת בכל הופעה."
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        toast({
          variant: 'destructive',
          title: language === 'en' ? 'Error fetching testimonials' : 'שגיאה בטעינת המלצות',
          description: language === 'en' 
            ? "Couldn't load testimonials. Please try again later." 
            : "לא ניתן לטעון המלצות. אנא נסה שוב מאוחר יותר.",
        });
        
        // Fallback to empty array
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [language]);

  // Translations
  const texts = {
    fanTestimonials: language === 'en' ? 'FAN TESTIMONIALS' : 'המלצות מעריצים',
    description: language === 'en' 
      ? 'Hear what our fans have to say about the Moonlight experience.' 
      : 'שמעו מה המעריצים שלנו אומרים על חווית מונלייט.',
    loading: language === 'en' ? 'Loading testimonials...' : 'טוען המלצות...',
    noTestimonials: language === 'en' 
      ? 'No testimonials available at the moment.' 
      : 'אין המלצות זמינות כרגע.',
  };

  return (
    <section id="testimonials" className="py-20 bg-band-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-band-purple/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            {texts.fanTestimonials.split(' ')[0]} <span className="text-band-pink">{texts.fanTestimonials.split(' ')[1]}</span>
          </h2>
          <div className="h-1 w-20 bg-band-pink mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            {texts.description}
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-pink border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-white/70">{texts.loading}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70">{texts.noTestimonials}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-black/50 border-band-pink/20 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-band-pink fill-band-pink mr-1" />
                    ))}
                  </div>
                  <p className="text-white/90 italic mb-6">"{testimonial.content}"</p>
                  <div>
                    <h4 className="text-white font-medium">{testimonial.author}</h4>
                    <p className="text-white/60 text-sm">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
