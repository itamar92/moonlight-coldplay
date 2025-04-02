
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Json } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
  logo_url: string;
}

interface MultilingualHeroContent {
  en: HeroContent;
  he: HeroContent;
}

const defaultContent: MultilingualHeroContent = {
  en: {
    title: 'MOONLIGHT',
    subtitle: 'COLDPLAY TRIBUTE BAND',
    description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision. Join us on a musical journey through the stars.',
    button1_text: 'UPCOMING SHOWS',
    button1_link: '#shows',
    button2_text: 'FOLLOW US',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png'
  },
  he: {
    title: 'מונלייט',
    subtitle: 'להקת מחווה לקולדפליי',
    description: 'חווה את הקסם של המוזיקה האיקונית של קולדפליי בהופעה חיה עם תשוקה ודיוק. הצטרף אלינו למסע מוזיקלי בין הכוכבים.',
    button1_text: 'הופעות קרובות',
    button1_link: '#shows',
    button2_text: 'עקבו אחרינו',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png'
  }
};

// Helper function to validate if an object is a valid HeroContent
const isValidHeroContent = (obj: any): obj is HeroContent => {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    !Array.isArray(obj) &&
    typeof obj.title === 'string' &&
    typeof obj.subtitle === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.button1_text === 'string' &&
    typeof obj.button1_link === 'string' &&
    typeof obj.button2_text === 'string' &&
    typeof obj.button2_link === 'string' &&
    typeof obj.logo_url === 'string'
  );
};

// Helper function to validate multilingual content
const isValidMultilingualContent = (obj: any): obj is MultilingualHeroContent => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    isValidHeroContent(obj.en) &&
    isValidHeroContent(obj.he)
  );
};

const HeroSection = () => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('Fetching hero content...');
        
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('section', 'hero')
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching hero content:', error);
            toast({
              variant: 'destructive',
              title: 'Error loading content',
              description: 'There was a problem loading the hero content.'
            });
          } else {
            console.log('Hero content not found in database, using defaults');
          }
          setLoading(false);
          return;
        }
        
        console.log('Hero content fetched successfully:', data);
        
        if (data && data.content) {
          try {
            // Try to parse the content as multilingual content
            const heroContentData = data.content as Record<string, any>;
            
            if (isValidMultilingualContent(heroContentData)) {
              console.log('Valid multilingual content detected');
              setContent(heroContentData);
            } else if (isValidHeroContent(heroContentData)) {
              console.log('Legacy single-language content detected, converting to multilingual');
              setContent({
                en: heroContentData as HeroContent,
                he: defaultContent.he // Use default for Hebrew
              });
            } else {
              console.error('Hero content has invalid structure:', heroContentData);
              toast({
                variant: 'destructive',
                title: 'Content format error',
                description: 'The hero content has an invalid structure. Using defaults.'
              });
            }
          } catch (parseError) {
            console.error('Error parsing hero content:', parseError);
            toast({
              variant: 'destructive',
              title: 'Content parsing error',
              description: 'Could not parse the hero content. Using defaults.'
            });
          }
        } else {
          console.log('No content data found, using defaults');
        }
      } catch (error) {
        console.error('Error in hero content fetch:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading content',
          description: 'There was a problem loading the hero content.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
    
    // Check for session and admin status
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }
        
        setSession(session);
        
        if (session) {
          // Check if user is admin
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            return;
          }
            
          setIsAdmin(!!profileData?.is_admin);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
    
    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(!!profileData?.is_admin);
        } else {
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Get the appropriate content based on the current language
  const currentContent = content[language] || content.en;

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="absolute top-20 right-4 z-20">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/40 border-band-purple text-band-purple hover:bg-black/60 flex items-center gap-2" 
            asChild
          >
            <Link to="/editor">
              <Edit size={16} />
              Edit Content
            </Link>
          </Button>
        </div>
      )}
      
      {/* Background with Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={currentContent.logo_url} 
            alt="Moonlight Logo" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-band-dark/80 via-band-dark/70 to-band-dark"></div>
        </div>
      </div>
      
      {/* Floating elements for cosmic effect */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-band-purple/20 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-band-pink/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-36 h-36 rounded-full bg-band-blue/20 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="w-72 h-72 md:w-80 md:h-80 mx-auto rounded-full" />
            <Skeleton className="h-10 max-w-md mx-auto" />
            <Skeleton className="h-6 max-w-xs mx-auto" />
            <Skeleton className="h-24 max-w-2xl mx-auto" />
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40 mx-auto md:mx-0" />
              <Skeleton className="h-12 w-40 mx-auto md:mx-0" />
            </div>
          </div>
        ) : (
          <>
            <img 
              src={currentContent.logo_url} 
              alt="Moonlight Logo" 
              className="w-72 h-72 md:w-80 md:h-80 mx-auto mb-8 animate-pulse-glow"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow">
              <span className="text-white">{currentContent.title}</span>
            </h1>
            <h2 className="text-xl md:text-3xl font-light mb-8 text-band-purple">
              {currentContent.subtitle}
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
              {currentContent.description}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-band-purple hover:bg-band-purple/80 text-white glow-purple" asChild>
                <a href={currentContent.button1_link}>{currentContent.button1_text}</a>
              </Button>
              <Button size="lg" variant="outline" className="border-band-pink text-band-pink hover:bg-band-pink/10 glow-pink" asChild>
                <a href={currentContent.button2_link}>{currentContent.button2_text}</a>
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
