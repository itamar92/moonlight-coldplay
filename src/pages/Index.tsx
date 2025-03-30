
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  // Only run once when the app initializes to ensure admin user exists
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Check if the admin user already exists
        const { data: existingUser } = await supabase.auth.signInWithPassword({
          email: 'itamar92@gmail.com',
          password: 'admin',
        });
        
        // If user doesn't exist, create them
        if (!existingUser?.user) {
          // Sign up the admin user
          const { error: signupError, data } = await supabase.auth.signUp({
            email: 'itamar92@gmail.com',
            password: 'admin',
          });
          
          if (signupError) {
            console.error('Error creating admin user:', signupError);
            return;
          }
          
          // If user was created successfully, set them as admin in profiles table
          if (data?.user) {
            // Wait a moment for the user to be fully created
            setTimeout(async () => {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', data.user.id);
              
              if (updateError) {
                console.error('Error updating user profile:', updateError);
              } else {
                console.log('Admin user created successfully');
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error in admin user creation:', error);
      }
    };
    
    createAdminUser();
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
