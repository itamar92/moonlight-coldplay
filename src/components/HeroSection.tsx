
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background with Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/17b5ab98-9e49-4a35-a8f3-d56df8986bc7.png" 
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
        <img 
          src="/lovable-uploads/17b5ab98-9e49-4a35-a8f3-d56df8986bc7.png" 
          alt="Moonlight Logo" 
          className="w-56 h-56 md:w-64 md:h-64 mx-auto mb-8 animate-pulse-glow"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow">
          <span className="text-white">MOONLIGHT</span>
        </h1>
        <h2 className="text-xl md:text-3xl font-light mb-8 text-band-purple">
          COLDPLAY TRIBUTE BAND
        </h2>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
          Experience the magic of Coldplay's iconic music performed live with passion and precision. Join us on a musical journey through the stars.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-band-purple hover:bg-band-purple/80 text-white glow-purple">
            UPCOMING SHOWS
          </Button>
          <Button size="lg" variant="outline" className="border-band-pink text-band-pink hover:bg-band-pink/10 glow-pink">
            FOLLOW US
          </Button>
        </div>
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
