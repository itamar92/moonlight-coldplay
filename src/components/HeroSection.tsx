
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import HeroHeader from './hero/HeroHeader';
import HeroBackground from './hero/HeroBackground';
import HeroContent from './hero/HeroContent';
import HeroFooter from './hero/HeroFooter';
import { useHeroData } from './hero/useHeroData';

const HeroSection = () => {
  const { language } = useLanguage();
  const { loading, isAdmin, connectionError, currentContent } = useHeroData(language);

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      <HeroHeader isAdmin={isAdmin} connectionError={connectionError} />
      <HeroBackground logoUrl={currentContent.logo_url} />
      <HeroContent loading={loading} content={currentContent} />
      <HeroFooter />
    </section>
  );
};

export default HeroSection;
