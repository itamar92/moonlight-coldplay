
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    title: 'MOONLIGHT',
    subtitle: 'להקת המחווה לקולדפליי',
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

export const useHeroData = (language: string) => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        console.log('Fetching hero content...');
        
        // Add a timeout to prevent getting stuck loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database request timeout')), 100000)
        );
        
        const fetchPromise = supabase
          .from('content')
          .select('*')
          .eq('section', 'hero')
          .single();
        
        // Race between fetch and timeout
        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => {
            throw new Error('Database request timed out');
          })
        ]);
        
        if (error) {
          console.error('Error fetching hero content:', error);
          
          if (error.code !== 'PGRST116') { // Not found error
            toast({
              variant: 'destructive',
              title: 'Error loading content',
              description: 'There was a problem loading the hero content.'
            });
            
            // Set connection error if this is a network-related error
            if (error.message && (
                error.message.includes('fetch') || 
                error.message.includes('network') ||
                error.message.includes('timeout')
            )) {
              setConnectionError(true);
            }
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
        
        // Show connection error message for network-related issues
        if (error instanceof Error && (
            error.message.includes('fetch') || 
            error.message.includes('network') ||
            error.message.includes('timeout')
        )) {
          setConnectionError(true);
        }
        
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
        // Get current session - fixed method call
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        const session = data.session;
        setSession(session);
        
        if (session) {
          // Check if user is admin
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error checking admin status:', profileError);
          } else {
            setIsAdmin(!!profileData?.is_admin);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
    
    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', newSession.user.id)
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
  const currentContent = content[language as keyof MultilingualHeroContent] || content.en;

  return {
    loading,
    isAdmin,
    connectionError,
    session,
    currentContent
  };
};

export type { HeroContent, MultilingualHeroContent };
