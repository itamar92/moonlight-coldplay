
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ShowsSection from '../components/ShowsSection';
import MediaSection from '../components/MediaSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FooterSection from '../components/FooterSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const { toast } = useToast();
  const { language } = useLanguage();

  // Only run once when the app initializes to ensure admin user exists
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Check if the admin user already exists by trying to sign in
        const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'itamar92@gmail.com',
          password: 'admin123456', // Use a longer password to meet requirements
        });
        
        // If user exists and sign-in was successful, we're done
        if (existingUser?.user) {
          console.log('Admin user already exists and credentials are valid');
          
          // Ensure the user has admin privileges
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', existingUser.user.id);
          
          if (updateError) {
            console.error('Error updating admin privileges:', updateError);
          }
          
          return;
        }
        
        // If sign-in failed because the user doesn't exist, create the user
        if (signInError) {
          console.log('Creating admin user...');
          // Try to create the admin user
          const { data: newUser, error: signupError } = await supabase.auth.signUp({
            email: 'itamar92@gmail.com',
            password: 'admin123456', // Use a longer password to meet requirements
          });
          
          if (signupError) {
            console.error('Error creating admin user:', signupError);
            return;
          }
          
          // If user was created successfully, set them as admin in profiles table
          if (newUser?.user) {
            console.log('Admin user created:', newUser.user.id);
            // Wait a moment for the user to be fully created
            setTimeout(async () => {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', newUser.user.id);
              
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
    <div className={`min-h-screen bg-band-dark text-white ${language === 'he' ? 'rtl' : 'ltr'}`}>
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
