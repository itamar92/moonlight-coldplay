
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Only run once when the app initializes to check connection and admin user
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Check database connection with retries
        const isConnected = await checkSupabaseConnection(2);
        
        if (!isConnected) {
          console.error('Failed to connect to the database after multiple attempts');
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Failed to connect to the database. Some features may not work properly.'
          });
          setIsLoading(false);
          return;
        }
        
        // Connection successful, proceed with checks
        // Check if session exists
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
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
        console.error('Error in initialization:', error);
        setHasConnectionError(true);
        toast({
          variant: 'destructive',
          title: 'Initialization Error',
          description: 'There was a problem initializing the application.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [toast]);

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
