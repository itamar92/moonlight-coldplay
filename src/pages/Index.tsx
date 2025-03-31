
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

  // Only run once when the app initializes to check if admin user exists
  useEffect(() => {
    const checkForAdminUser = async () => {
      try {
        // Check if session exists - fixed method call
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session) {
          console.log('User is already logged in');
          return;
        }
        
        // Check if the admin user exists in profiles table
        const { data: existingAdmins, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true)
          .limit(1);
          
        if (profileError) {
          console.error('Error checking for admin users:', profileError);
          return;
        }
        
        if (existingAdmins && existingAdmins.length > 0) {
          console.log('Admin user already exists in profiles');
          return;
        }
        
        // Only proceed with checking if no admin exists
        console.log('No admin found in profiles, but not creating one automatically');
      } catch (error) {
        console.error('Error in admin user check:', error);
      }
    };
    
    checkForAdminUser();
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
