
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { UserRoundIcon, MenuIcon } from 'lucide-react';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Check authentication and admin status
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.session.user.id)
            .single();
            
          setIsAdmin(profileData?.is_admin || false);
        }, 0);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(profileData?.is_admin || false);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-band-dark/80 backdrop-blur-sm z-50 border-b border-band-purple/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png" 
            alt="Moonlight Logo" 
            className="h-10 w-10"
          />
          <span className="font-bold text-2xl text-white text-glow">MOONLIGHT</span>
        </Link>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#home" className="text-white hover:text-band-purple transition-colors">HOME</a>
          <a href="#shows" className="text-white hover:text-band-purple transition-colors">SHOWS</a>
          <a href="#media" className="text-white hover:text-band-purple transition-colors">MEDIA</a>
          <a href="#testimonials" className="text-white hover:text-band-purple transition-colors">TESTIMONIALS</a>
          <a href="#contact" className="text-white hover:text-band-purple transition-colors">CONTACT</a>
          {isAdmin && (
            <Link to="/admin" className="text-band-purple hover:text-band-purple/80 transition-colors">ADMIN</Link>
          )}
          {session ? (
            <Link to="/auth" className="text-white/70 hover:text-white flex items-center">
              <UserRoundIcon className="h-4 w-4 mr-1" />
              ACCOUNT
            </Link>
          ) : (
            <Link to="/auth" className="text-white/70 hover:text-white">LOGIN</Link>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-band-dark border-band-purple/20 text-white">
            <div className="flex flex-col space-y-4 mt-8">
              <a href="#home" className="text-white hover:text-band-purple transition-colors text-lg">HOME</a>
              <a href="#shows" className="text-white hover:text-band-purple transition-colors text-lg">SHOWS</a>
              <a href="#media" className="text-white hover:text-band-purple transition-colors text-lg">MEDIA</a>
              <a href="#testimonials" className="text-white hover:text-band-purple transition-colors text-lg">TESTIMONIALS</a>
              <a href="#contact" className="text-white hover:text-band-purple transition-colors text-lg">CONTACT</a>
              {isAdmin && (
                <Link to="/admin" className="text-band-purple hover:text-band-purple/80 transition-colors text-lg">ADMIN</Link>
              )}
              {session ? (
                <Link to="/auth" className="text-white/70 hover:text-white flex items-center text-lg">
                  <UserRoundIcon className="h-4 w-4 mr-2" />
                  ACCOUNT
                </Link>
              ) : (
                <Link to="/auth" className="text-white/70 hover:text-white text-lg">LOGIN</Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
