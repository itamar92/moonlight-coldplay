import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    description:
      "Experience the magic of Coldplay's iconic music performed live with passion and precision. Join us on a musical journey through the stars.",
    button1_text: 'UPCOMING SHOWS',
    button1_link: '#shows',
    button2_text: 'FOLLOW US',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png',
  },
  he: {
    title: 'MOONLIGHT',
    subtitle: 'להקת המחווה לקולדפליי',
    description:
      'חווה את הקסם של המוזיקה האיקונית של קולדפליי בהופעה חיה עם תשוקה ודיוק. הצטרף אלינו למסע מוזיקלי בין הכוכבים.',
    button1_text: 'הופעות קרובות',
    button1_link: '#shows',
    button2_text: 'עקבו אחרינו',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png',
  },
};

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

export const useHeroData = (language: string) => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return;

        setSession(data.session);

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
      } catch {
        // ignore
      }
    };

    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        setConnectionError(false);

        // Google Sheets is now the source of truth for content
        const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-content-sheet');

        if (functionError) {
          throw functionError;
        }

        const hero = functionData?.content?.hero;
        if (!hero) return;

        const enCandidate: any = {
          title: hero.title?.en,
          subtitle: hero.subtitle?.en,
          description: hero.description?.en,
          button1_text: hero.button1_text?.en,
          button1_link: hero.button1_link?.en,
          button2_text: hero.button2_text?.en,
          button2_link: hero.button2_link?.en,
          logo_url: hero.logo_url?.en,
        };

        const heCandidate: any = {
          title: hero.title?.he,
          subtitle: hero.subtitle?.he,
          description: hero.description?.he,
          button1_text: hero.button1_text?.he,
          button1_link: hero.button1_link?.he,
          button2_text: hero.button2_text?.he,
          button2_link: hero.button2_link?.he,
          logo_url: hero.logo_url?.he,
        };

        if (isValidHeroContent(enCandidate) && isValidHeroContent(heCandidate)) {
          setContent({ en: enCandidate, he: heCandidate });
        }
      } catch (error) {
        console.error('Error fetching hero content from Google Sheets:', error);
        setConnectionError(true);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchHeroContent();
  }, []);

  const currentContent = content[language as keyof MultilingualHeroContent] || content.en;

  return {
    loading,
    isAdmin,
    connectionError,
    session,
    currentContent,
  };
};

export type { HeroContent, MultilingualHeroContent };

