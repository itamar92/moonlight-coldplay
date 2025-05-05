import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase, checkSupabaseConnection, testBasicConnection, testDataAccess } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Only run once when the app initializes to check connection and admin user
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Test basic connection first
        console.log('Testing basic Supabase connection...');
        const basicConnectionTest = await testBasicConnection();
        console.log('Basic connection test result:', basicConnectionTest);
        
        if (!basicConnectionTest) {
          console.error('Basic connection test failed');
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Failed to connect to the database. Default content is being displayed.'
          });
          setIsLoading(false);
          return;
        }
        
        // Test data access to see if we can retrieve data from tables
        await testDataAccess();
        
        // Then proceed with the regular connection check
        const isConnected = await checkSupabaseConnection(4, 1000);
        setConnectionAttempts(prev => prev + 1);
        
        if (!isConnected) {
          console.error('Failed to connect to the database after multiple attempts');
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Failed to connect to the database. Default content is being displayed.'
          });
          setIsLoading(false);
          return;
        }
        
        // Connection successful, proceed with checks
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
  }, [toast, connectionAttempts]);

  // Try to reconnect periodically if there's a connection error
  useEffect(() => {
    let reconnectTimer: number | undefined;
    
    if (hasConnectionError && connectionAttempts < 3) {
      reconnectTimer = window.setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
      }, 5000); // Try reconnecting every 5 seconds up to 3 total attempts
    }
    
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [hasConnectionError, connectionAttempts]);

  return (
    <div className="min-h-screen bg-band-dark text-white">
      {hasConnectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          Database connection failed. Showing default content instead.
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
