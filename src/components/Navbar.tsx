
import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-band-dark/80 backdrop-blur-sm z-50 border-b border-band-purple/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png" 
            alt="Moonlight Logo" 
            className="h-10 w-10"
          />
          <span className="font-bold text-2xl text-white text-glow">MOONLIGHT</span>
        </Link>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#home" className="text-white hover:text-band-purple transition-colors">HOME</a>
          <a href="#shows" className="text-white hover:text-band-purple transition-colors">SHOWS</a>
          <a href="#media" className="text-white hover:text-band-purple transition-colors">MEDIA</a>
          <a href="#testimonials" className="text-white hover:text-band-purple transition-colors">TESTIMONIALS</a>
          <a href="#contact" className="text-white hover:text-band-purple transition-colors">CONTACT</a>
        </div>
        
        <button className="md:hidden text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
