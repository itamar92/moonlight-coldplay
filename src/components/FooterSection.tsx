
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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
}

const defaultFooterData: FooterData = {
  companyName: 'MOONLIGHT',
  description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision.',
  email: 'booking@moonlighttribute.com',
  phone: '+1 (555) 123-4567',
  location: 'Los Angeles, CA',
  socialLinks: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#'
  }
};

const FooterSection = () => {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('content')
          .eq('section', 'footer')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // "Not found" error
            console.error('Error fetching footer data:', error);
          }
          // If not found, we'll use the default values
          return;
        }

        if (data?.content) {
          setFooterData(data.content as FooterData);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const handleSubscribe = () => {
    if (email.trim()) {
      // Here you would typically handle newsletter subscription
      // For now, just show an alert
      alert(`Thank you for subscribing with ${email}`);
      setEmail('');
    }
  };

  return (
    <footer id="contact" className="pt-20 pb-10 bg-black relative overflow-hidden">
      {/* Decorative elements */}
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
              <h3 className="text-white text-xl font-bold text-glow">{footerData.companyName}</h3>
            </div>
            <p className="text-white/60 mb-6">
              {footerData.description}
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
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-white/60 hover:text-band-purple transition-colors">Home</a></li>
              <li><a href="#shows" className="text-white/60 hover:text-band-purple transition-colors">Upcoming Shows</a></li>
              <li><a href="#media" className="text-white/60 hover:text-band-purple transition-colors">Media Gallery</a></li>
              <li><a href="#testimonials" className="text-white/60 hover:text-band-purple transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-band-purple transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">Contact Information</h3>
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
            <h3 className="text-white font-bold mb-6">Newsletter</h3>
            <p className="text-white/60 mb-4">
              Subscribe to get updates on upcoming shows and exclusive content.
            </p>
            <div className="flex space-x-2">
              <Input 
                placeholder="Your email" 
                className="bg-white/10 border-white/20 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                className="bg-band-purple hover:bg-band-purple/80 text-white"
                onClick={handleSubscribe}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} {footerData.companyName} - Coldplay Tribute Band. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
