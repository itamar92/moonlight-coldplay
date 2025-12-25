
import React, { useState, useEffect } from 'react';
import { useHeroData } from '@/hooks/useHeroData';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const HeroSection = () => {
  const { language } = useLanguage();
  const { loading, currentContent, connectionError } = useHeroData(language);
  const [showDbLink, setShowDbLink] = useState(false);
  
  // Show the database link after 5 seconds if there are connection issues
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => {
        setShowDbLink(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  if (loading) {
    return (
      <section className="py-24 text-center">
        <div className="container mx-auto">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin h-full w-full border-4 border-t-band-purple rounded-full"></div>
          </div>
          <p className="text-white/70">Loading content...</p>
        </div>
      </section>
    );
  }

  if (connectionError) {
    return (
      <section className="py-24 text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Database Connection Error</h2>
            <p className="mb-4 text-white/80">
              Could not connect to the database. The site is displaying default content.
            </p>
            {showDbLink && (
              <Button variant="outline" className="border-red-500/50 text-white" asChild>
                <Link to="/diagnostics" className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Run Connection Diagnostics
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="container mx-auto text-center mt-8">
          <img
            src="/placeholder.svg"
            alt="Moonlight Logo"
            className="mx-auto h-32 md:h-48 mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
            {language === 'en' ? 'Moonlight Band' : 'להקת מונלייט'}
          </h1>
          <h2 className="text-2xl md:text-3xl mb-8 text-white">
            {language === 'en' ? 'Live Music & Entertainment' : 'מוזיקה חיה ובידור'}
          </h2>
          <p className="text-lg md:text-xl mb-12 text-white/80 max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Experience the magic of live music with our unique blend of energy and passion.'
              : 'חווה את הקסם של המוזיקה החיה עם השילוב הייחודי שלנו של אנרגיה ותשוקה.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-band-dark">
      <div className="container mx-auto text-center">
        <img
          src={currentContent.logo_url || "/placeholder.svg"}
          alt="Moonlight Logo"
          className="mx-auto h-32 md:h-48 mb-8"
          onError={(e) => {
            console.log('[Image Error] Failed to load logo:', currentContent.logo_url);
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
          {currentContent.title}
        </h1>
        <h2 className="text-2xl md:text-3xl mb-8 text-white">
          {currentContent.subtitle}
        </h2>
        <p className="text-lg md:text-xl mb-12 text-white/80 max-w-2xl mx-auto">
          {currentContent.description}
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href={currentContent.button1_link}
            className="bg-band-purple hover:bg-band-purple/90 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            {currentContent.button1_text}
          </a>
          <a
            href={currentContent.button2_link}
            className="bg-transparent border border-white hover:border-band-purple text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            {currentContent.button2_text}
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
