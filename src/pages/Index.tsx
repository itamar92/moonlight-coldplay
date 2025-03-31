
import React, { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Only run once when the app initializes to check if admin user exists
  useEffect(() => {
    const checkForAdminUser = async () => {
      try {
        setIsLoading(true);
        
        // Check if session exists - fixed method call
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setHasConnectionError(true);
          return;
        }
        
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
        setHasConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForAdminUser();
  }, []);

  return (
    <div className="min-h-screen bg-band-dark text-white">
      {hasConnectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          Connection to database failed. Some features may not work properly.
        </div>
      )}
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
