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

export const useHeroData = (language: string) => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);

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