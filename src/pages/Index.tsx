
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

  // Simplified initialization - just check if we can connect without blocking the UI
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple, non-blocking connection test
        const { error } = await supabase.from('shows').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log('Database connection issue detected:', error);
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Warning',
            description: 'Some features may not work properly due to database connection issues.',
          });
        }
      } catch (error) {
        console.log('Connection check failed:', error);
        setHasConnectionError(true);
      }
    };

    // Run connection check after a short delay to not block initial render
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
