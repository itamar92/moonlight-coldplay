
import React from 'react';

interface HeroBackgroundProps {
  logoUrl: string;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({ logoUrl }) => {
  return (
    <>
      {/* Background with Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={logoUrl} 
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
    </>
  );
};

export default HeroBackground;
