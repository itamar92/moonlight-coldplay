
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
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Non-blocking connection test (Google Sheets edge function)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.functions.invoke('fetch-google-sheet');

        if (error) {
          console.log('Sheets connection issue detected:', error);
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Warning',
            description: 'Some features may not work properly due to connectivity issues.',
          });
        }
      } catch (error) {
        console.log('Connection check failed:', error);
        setHasConnectionError(true);
      }
    };

    const timer = setTimeout(checkConnection, 1000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-band-dark text-white">
      {hasConnectionError && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-black p-2 text-center z-50 text-sm">
          Some features may be limited due to connectivity issues.
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
