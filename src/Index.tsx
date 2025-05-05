
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase, checkSupabaseConnection, testBasicConnection } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Only run once when the app initializes to check connection
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
            description: 'Failed to connect to the database. Default content is being displayed.',
            action: (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDiagnostics(true)}
                className="border-destructive text-destructive"
              >
                Run Diagnostics
              </Button>
            ),
          });
          setIsLoading(false);
          return;
        }
        
        // Then proceed with the regular connection check
        const isConnected = await checkSupabaseConnection(4, 1000);
        setConnectionAttempts(prev => prev + 1);
        
        if (!isConnected) {
          console.error('Failed to connect to the database after multiple attempts');
          setHasConnectionError(true);
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Failed to connect to the database. Default content is being displayed.',
          });
          setIsLoading(false);
          return;
        }
        
        // Connection successful
        console.log('Successfully connected to Supabase');
        
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

  // Show diagnostics link after 5 seconds if there's a connection error
  useEffect(() => {
    if (hasConnectionError) {
      const timer = setTimeout(() => {
        setShowDiagnostics(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionError]);

  return (
    <div className="min-h-screen bg-band-dark text-white">
      {hasConnectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          Database connection failed. Showing default content instead.
          {showDiagnostics && (
            <Link to="/diagnostics" className="ml-2 underline font-medium">
              Run Connection Diagnostics
            </Link>
          )}
        </div>
      )}
      <Navbar />
      <HeroSection />
      <ShowsSection />
      <MediaSection />
      <TestimonialsSection />
      <FooterSection />
      
      {hasConnectionError && showDiagnostics && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            variant="outline"
            size="sm"
            className="bg-black/50 border-red-500/50 text-white flex items-center"
            asChild
          >
            <Link to="/diagnostics">
              <Database className="mr-2 h-4 w-4" />
              Diagnose Database Issues
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
