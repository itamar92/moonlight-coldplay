import React from 'react';
import { useHeroData } from '@/hooks/useHeroData';
import { useLanguage } from '@/context/LanguageContext';

const HeroSection = () => {
  const { language } = useLanguage();
  const { loading, currentContent, connectionError } = useHeroData(language);

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p>Loading...</p>
      </section>
    );
  }

  if (connectionError) {
    return (
      <section className="py-24 text-center">
        <p>Error: Could not load content. Please check your connection.</p>
      </section>
    );
  }

  return (
    <section className="py-24 bg-band-dark">
      <div className="container mx-auto text-center">
        <img
          src={currentContent.logo_url}
          alt="Moonlight Logo"
          className="mx-auto h-32 md:h-48 mb-8"
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
