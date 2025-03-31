
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

type Testimonial = {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
};

interface TranslatedContent {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const TestimonialsSection = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState<{
    en: TranslatedContent;
    he: TranslatedContent;
  }>({
    en: {
      title: "FAN TESTIMONIALS",
      subtitle: "Hear what our fans have to say about the Moonlight experience.",
      testimonials: [
        {
          id: 1,
          name: "Sarah Johnson",
          location: "Los Angeles, CA",
          rating: 5,
          text: "Absolutely amazing! I've seen Coldplay live, and these guys capture their energy and sound perfectly. Can't wait for their next show!"
        },
        {
          id: 2,
          name: "Michael Chen",
          location: "Boston, MA",
          rating: 5,
          text: "Moonlight brings the magic of Coldplay to life in a way that feels both authentic and fresh. Their rendition of 'Fix You' had me in tears."
        },
        {
          id: 3,
          name: "Jessica Williams",
          location: "Austin, TX",
          rating: 5,
          text: "I've been to three of their shows already, and each one has been better than the last. Their passion for the music shines through in every performance."
        },
      ]
    },
    he: {
      title: "המלצות מעריצים",
      subtitle: "שמעו מה המעריצים שלנו אומרים על החוויה של מונלייט.",
      testimonials: [
        {
          id: 1,
          name: "שרה ג'ונסון",
          location: "לוס אנג'לס, קליפורניה",
          rating: 5,
          text: "פשוט מדהים! ראיתי את קולדפליי בהופעה חיה, והחבר'ה האלה מצליחים לשחזר את האנרגיה והצליל שלהם בצורה מושלמת. מחכה בקוצר רוח להופעה הבאה שלהם!"
        },
        {
          id: 2,
          name: "מייקל צ'ן",
          location: "בוסטון, מסצ'וסטס",
          rating: 5,
          text: "מונלייט מביאים את הקסם של קולדפליי לחיים בצורה שמרגישה אותנטית וגם רעננה. הביצוע שלהם ל'Fix You' הביא אותי לדמעות."
        },
        {
          id: 3,
          name: "ג'סיקה וויליאמס",
          location: "אוסטין, טקסס",
          rating: 5,
          text: "כבר הייתי בשלוש הופעות שלהם, וכל אחת הייתה טובה יותר מהקודמת. התשוקה שלהם למוזיקה ניכרת בכל הופעה."
        },
      ]
    }
  });
  
  useEffect(() => {
    const fetchTestimonialsContent = async () => {
      try {
        console.log('Fetching testimonials content...');
        const { data, error } = await supabase
          .from('content')
          .select('content')
          .eq('section', 'testimonials')
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error('Error fetching testimonials content:', error);
          } else {
            console.log('No testimonials content found in database, using defaults');
          }
          return;
        }
        
        if (data?.content) {
          try {
            const parsedContent = typeof data.content === 'string' 
              ? JSON.parse(data.content) 
              : data.content;
              
            console.log('Testimonials content fetched successfully');
            setContent(parsedContent);
          } catch (parseError) {
            console.error('Error parsing testimonials content:', parseError);
          }
        }
      } catch (error) {
        console.error('Exception in testimonials content fetch:', error);
      }
    };
    
    fetchTestimonialsContent();
  }, []);

  // Get the correct content based on the current language
  const currentContent = content[language];
  
  return (
    <section id="testimonials" className="py-20 bg-band-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-band-purple/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            {language === 'en' ? (
              <>FAN <span className="text-band-pink">TESTIMONIALS</span></>
            ) : (
              <><span className="text-band-pink">המלצות</span> מעריצים</>
            )}
          </h2>
          <div className="h-1 w-20 bg-band-pink mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            {currentContent.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentContent.testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-black/50 border-band-pink/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-band-pink fill-band-pink mr-1" />
                  ))}
                </div>
                <p className="text-white/90 italic mb-6">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-white font-medium">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.location}</p>
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
