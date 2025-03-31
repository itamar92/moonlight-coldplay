
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Close mobile menu when switching to desktop
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  const getNavItemSpacing = () => {
    // Add more spacing between Hebrew nav items
    return language === 'he' ? 'mx-6' : 'mx-3';
  };

  const navItems = [
    {
      path: '/',
      nameEn: 'Home',
      nameHe: 'דף הבית'
    },
    {
      path: '/shows',
      nameEn: 'Shows',
      nameHe: 'הופעות'
    }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-white text-xl font-bold">MOONLIGHT</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            <ul className="flex mr-6">
              {navItems.map((item) => (
                <li key={item.path} className={getNavItemSpacing()}>
                  <Link 
                    to={item.path} 
                    className="text-white hover:text-band-purple transition-colors"
                  >
                    {language === 'en' ? item.nameEn : item.nameHe}
                  </Link>
                </li>
              ))}
            </ul>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="ml-4 text-white focus:outline-none"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 bg-black/90 backdrop-blur-sm rounded-lg">
            <ul className="flex flex-col items-center space-y-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-white hover:text-band-purple transition-colors text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {language === 'en' ? item.nameEn : item.nameHe}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
