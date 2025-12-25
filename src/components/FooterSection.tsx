import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { fetchContent } from '@/lib/googleSheets';

interface FooterTranslations {
  companyName: string;
  description: string;
}

interface FooterData {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  translations?: {
    en: FooterTranslations;
    he: FooterTranslations;
  };
}

const defaultFooterData: FooterData = {
  companyName: 'MOONLIGHT',
  description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision.',
  email: 'amiras83@gmail.com',
  phone: ' +972-54-550-6561',
  location: 'Israel',
  socialLinks: {
    facebook: 'https://www.facebook.com/xandycoldplay',
    instagram: '#',
    twitter: '#',
    youtube: 'https://www.youtube.com/@MoonLight-v6s'
  },
  translations: {
    en: {
      companyName: 'MOONLIGHT',
      description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision.'
    },
    he: {
      companyName: 'MOONLIGHT',
      description: 'חווה את הקסם של המוסיקה האיקונית של קולדפליי שמבוצעת בצורה חיה עם תשוקה ודיוק.'
    }
  }
};

const FooterSection = () => {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        setIsLoading(true);

        const contentData = await fetchContent();
        const footer = contentData?.footer;
        if (!footer) return;

        const parsed: FooterData = {
          companyName: footer.companyName?.en || defaultFooterData.companyName,
          description: footer.description?.en || defaultFooterData.description,
          email: footer.email?.en || defaultFooterData.email,
          phone: footer.phone?.en || defaultFooterData.phone,
          location: footer.location?.en || defaultFooterData.location,
          socialLinks: {
            facebook: footer.facebook?.en || defaultFooterData.socialLinks.facebook,
            instagram: footer.instagram?.en || defaultFooterData.socialLinks.instagram,
            twitter: footer.twitter?.en || defaultFooterData.socialLinks.twitter,
            youtube: footer.youtube?.en || defaultFooterData.socialLinks.youtube,
          },
          translations: {
            en: {
              companyName: footer.companyName?.en || defaultFooterData.translations?.en.companyName || defaultFooterData.companyName,
              description: footer.description?.en || defaultFooterData.translations?.en.description || defaultFooterData.description,
            },
            he: {
              companyName: footer.companyName?.he || defaultFooterData.translations?.he.companyName || defaultFooterData.companyName,
              description: footer.description?.he || defaultFooterData.translations?.he.description || defaultFooterData.description,
            },
          },
        };

        setFooterData(parsed);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFooterData();
  }, []);

  const handleSubscribe = () => {
    if (email.trim()) {
      alert(`Thank you for subscribing with ${email}`);
      setEmail('');
    }
  };

  const getTranslatedText = (field: keyof FooterTranslations) => {
    if (footerData.translations && footerData.translations[language]) {
      return footerData.translations[language][field];
    }
    return footerData[field];
  };

  return (
    <footer id="contact" className="pt-20 pb-10 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cosmic"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="mb-6 flex items-center">
              <img 
                src="/lovable-uploads/17b5ab98-9e49-4a35-a8f3-d56df8986bc7.png" 
                alt="Moonlight Logo" 
                className="w-12 h-12 mr-3"
              />
              <h3 className="text-white text-xl font-bold text-glow">{getTranslatedText('companyName')}</h3>
            </div>
            <p className="text-white/60 mb-6">
              {getTranslatedText('description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href={footerData.socialLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-band-purple transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={footerData.socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-band-pink transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href={footerData.socialLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-band-blue transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a 
                href={footerData.socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-white transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">{language === 'en' ? 'Quick Links' : 'קישורים מהירים'}</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-white/60 hover:text-band-purple transition-colors">{language === 'en' ? 'Home' : 'דף הבית'}</a></li>
              <li><a href="#shows" className="text-white/60 hover:text-band-purple transition-colors">{language === 'en' ? 'Upcoming Shows' : 'הופעות קרובות'}</a></li>
              <li><a href="#media" className="text-white/60 hover:text-band-purple transition-colors">{language === 'en' ? 'Media Gallery' : 'גלריית מדיה'}</a></li>
              <li><a href="#testimonials" className="text-white/60 hover:text-band-purple transition-colors">{language === 'en' ? 'Testimonials' : 'המלצות'}</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-band-purple transition-colors">{language === 'en' ? 'Contact Us' : 'צור קשר'}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">{language === 'en' ? 'Contact Information' : 'פרטי התקשרות'}</h3>
            <ul className="space-y-3 text-white/60">
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-band-purple" />
                {footerData.email}
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-band-pink" />
                {footerData.phone}
              </li>
              <li className="flex items-center">
                <MapPin size={16} className="mr-2 text-band-blue" />
                {footerData.location}
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">{language === 'en' ? 'Newsletter' : 'עלון מידע'}</h3>
            <p className="text-white/60 mb-4">
              {language === 'en' ? 'Subscribe to get updates on upcoming shows and exclusive content.' : 'הירשם לקבלת עדכונים על הופעות קרובות ותוכן בלעדי.'}
            </p>
            <div className="flex space-x-2">
              <Input 
                placeholder={language === 'en' ? "Your email" : "האימייל שלך"} 
                className="bg-white/10 border-white/20 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                className="bg-band-purple hover:bg-band-purple/80 text-white"
                onClick={handleSubscribe}
              >
                {language === 'en' ? 'Subscribe' : 'הרשמה'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} {getTranslatedText('companyName')} - {language === 'en' ? 'Coldplay Tribute Band. All rights reserved.' : 'להקת מחווה לקולדפליי. כל הזכויות שמורות.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
