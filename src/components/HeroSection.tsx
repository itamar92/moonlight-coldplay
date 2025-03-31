
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
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

const defaultContent: HeroContent = {
  title: 'MOONLIGHT',
  subtitle: 'COLDPLAY TRIBUTE BAND',
  description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision. Join us on a musical journey through the stars.',
  button1_text: 'UPCOMING SHOWS',
  button1_link: '#shows',
  button2_text: 'FOLLOW US',
  button2_link: '#',
  logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png'
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

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('section', 'hero')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching hero content:', error);
          return;
        }
        
        if (data && data.content) {
          // Safely handle the content data with proper type checking
          const heroContentData = data.content;
          
          // Validate the data structure before setting state
          if (isValidHeroContent(heroContentData)) {
            setContent(heroContentData);
          } else {
            console.error('Hero content has invalid structure:', heroContentData);
          }
        }
      } catch (error) {
        console.error('Error in hero content fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background with Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={content.logo_url} 
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
              src={content.logo_url} 
              alt="Moonlight Logo" 
              className="w-72 h-72 md:w-80 md:h-80 mx-auto mb-8 animate-pulse-glow"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow">
              <span className="text-white">{content.title}</span>
            </h1>
            <h2 className="text-xl md:text-3xl font-light mb-8 text-band-purple">
              {content.subtitle}
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
              {content.description}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-band-purple hover:bg-band-purple/80 text-white glow-purple" asChild>
                <a href={content.button1_link}>{content.button1_text}</a>
              </Button>
              <Button size="lg" variant="outline" className="border-band-pink text-band-pink hover:bg-band-pink/10 glow-pink" asChild>
                <a href={content.button2_link}>{content.button2_text}</a>
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
