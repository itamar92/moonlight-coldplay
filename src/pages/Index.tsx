
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();

  // Only check if admin exists, don't try to create one automatically
  useEffect(() => {
    const checkAdminUser = async () => {
      try {
        // Check if there are any admin users in the profiles table
        const { data: adminUsers, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', true)
          .limit(1);
        
        if (error) {
          console.error('Error checking for admin users:', error);
          return;
        }
        
        if (adminUsers && adminUsers.length > 0) {
          console.log('Admin user already exists');
        } else {
          console.log('No admin users found. You can create one through the authentication page.');
        }
      } catch (error) {
        console.error('Error in admin user check:', error);
      }
    };
    
    checkAdminUser();
  }, []);

  return (
    <div className="min-h-screen bg-band-dark text-white">
      <Navbar />
      <HeroSection />
      <ShowsSection />
      <MediaSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
};

export default Index;
