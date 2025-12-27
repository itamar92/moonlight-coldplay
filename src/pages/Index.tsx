
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { SparklesCore } from '@/components/ui/sparkles';

const Index = () => {
  return (
    <div className="min-h-screen bg-band-dark text-white relative">
      {/* Sparkles background */}
      <div className="fixed inset-0 z-0">
        <SparklesCore
          id="main-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.4}
          particleDensity={80}
          particleColor="#9b5de5"
          className="h-full w-full"
          speed={2}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ShowsSection />
        <MediaSection />
        <TestimonialsSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
