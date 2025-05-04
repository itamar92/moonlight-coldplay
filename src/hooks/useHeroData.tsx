
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

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

export const useHeroData = (language: string) => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
          return;
        }
        setSession(data.session);
        
        // If session exists, check if user is admin
        if (data.session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .single();
            
          if (!profileError && profileData) {
            setIsAdmin(profileData.is_admin === true);
          }
        }
      } catch (error) {
        console.error('Error in session check:', error);
      }
    };

    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('content')
          .eq('section', 'hero')
          .single();
          
        if (error) {
          console.error('Error fetching hero content:', error);
          setConnectionError(true);
          return;
        }
        
        if (data && data.content) {
          // Fix: Add type checking and validation before setting the content
          const contentData = data.content;
          
          // Validate that the content has the expected structure
          if (
            typeof contentData === 'object' && 
            contentData !== null && 
            !Array.isArray(contentData) &&
            'en' in contentData && 
            'he' in contentData
          ) {
            // Create a properly typed object to satisfy TypeScript
            const typedContent: MultilingualHeroContent = {
              en: contentData.en as HeroContent,
              he: contentData.he as HeroContent
            };
            
            setContent(typedContent);
          } else {
            console.error('Hero content does not match expected format:', contentData);
            // Keep using default content
          }
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
        setConnectionError(true);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchHeroContent();
  }, []);

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
