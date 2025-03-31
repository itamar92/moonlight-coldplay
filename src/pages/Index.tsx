
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
        // Check if session exists
        const { data: { session } } = await supabase.auth.getSession();
        
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
        
        // Only proceed with creating admin if no admin exists
        console.log('No admin found in profiles, attempting to check if admin email exists');
        
        // Check if the email exists in auth
        const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserByEmail('itamar92@gmail.com');
        
        if (user) {
          console.log('Admin email exists, updating profile');
          // Ensure the user has admin privileges
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error updating admin privileges:', updateError);
          } else {
            console.log('Admin privileges updated successfully');
          }
          return;
        }
        
        // If we get here, there's no admin user at all, but we won't create one
        // as that seems to be causing issues
        console.log('No admin user found, but not creating one automatically');
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
