
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { UserRoundIcon, MenuIcon, LogOut, Settings } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Check authentication and admin status
  useEffect(() => {
    const checkSession = async () => {
      // Get current session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        // Check if user is admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.session.user.id)
          .single();
          
        setIsAdmin(!!profileData?.is_admin);
        console.log("Admin status:", !!profileData?.is_admin, profileData);
      }
    };

    checkSession();

    // Listen for authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        // Check if user is admin when auth state changes
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', currentSession.user.id)
          .single();
          
        setIsAdmin(!!profileData?.is_admin);
        console.log("Auth change - admin status:", !!profileData?.is_admin, profileData);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    }
  };

  // Translated menu items
  const menuItems = {
    home: language === 'en' ? 'HOME' : 'דף הבית',
    shows: language === 'en' ? 'SHOWS' : 'הופעות',
    media: language === 'en' ? 'MEDIA' : 'מדיה',
    testimonials: language === 'en' ? 'TESTIMONIALS' : 'המלצות',
    contact: language === 'en' ? 'CONTACT' : 'צור קשר',
    admin: language === 'en' ? 'ADMIN' : 'ניהול',
    account: language === 'en' ? 'ACCOUNT' : 'חשבון',
    login: language === 'en' ? 'LOGIN' : 'התחברות',
    logout: language === 'en' ? 'Logout' : 'התנתקות',
    contentEditor: language === 'en' ? 'Content Editor' : 'עורך תוכן'
  };

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
        
        <div className={`hidden md:flex ${language === 'he' ? 'space-x-0 rtl:space-x-reverse space-x-8' : 'space-x-8'} text-sm font-medium`}>
          <a href="#home" className="text-white hover:text-band-purple transition-colors px-3">{menuItems.home}</a>
          <a href="#shows" className="text-white hover:text-band-purple transition-colors px-3">{menuItems.shows}</a>
          <a href="#media" className="text-white hover:text-band-purple transition-colors px-3">{menuItems.media}</a>
          <a href="#testimonials" className="text-white hover:text-band-purple transition-colors px-3">{menuItems.testimonials}</a>
          <a href="#contact" className="text-white hover:text-band-purple transition-colors px-3">{menuItems.contact}</a>
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-band-purple transition-colors px-3 flex items-center">
              <span>{menuItems.admin}</span>
              {/* Admin badge */}
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full">ADMIN</span>
            </Link>
          )}
          <LanguageSwitcher />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-transparent flex items-center p-0">
                  <UserRoundIcon className="h-4 w-4 mr-1" />
                  {menuItems.account}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-band-dark border-band-purple/30 text-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{language === 'en' ? 'My Account' : 'החשבון שלי'}</span>
                    <span className="text-xs text-white/60">{session.user.email}</span>
                    {isAdmin && (
                      <span className="mt-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full w-fit text-band-purple">
                        {language === 'en' ? 'Admin' : 'מנהל'}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {isAdmin && (
                  <DropdownMenuItem
                    className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
                    asChild
                  >
                    <Link to="/editor" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{menuItems.contentEditor}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{menuItems.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-white/70 hover:text-white">{menuItems.login}</Link>
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
              <a href="#home" className="text-white hover:text-band-purple transition-colors text-lg">{menuItems.home}</a>
              <a href="#shows" className="text-white hover:text-band-purple transition-colors text-lg">{menuItems.shows}</a>
              <a href="#media" className="text-white hover:text-band-purple transition-colors text-lg">{menuItems.media}</a>
              <a href="#testimonials" className="text-white hover:text-band-purple transition-colors text-lg">{menuItems.testimonials}</a>
              <a href="#contact" className="text-white hover:text-band-purple transition-colors text-lg">{menuItems.contact}</a>
              {isAdmin && (
                <Link to="/admin" className="text-band-purple hover:text-band-purple/80 transition-colors text-lg flex items-center">
                  <span>{menuItems.admin}</span>
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full">ADMIN</span>
                </Link>
              )}
              <div className="py-2">
                <LanguageSwitcher />
              </div>
              
              {session ? (
                <>
                  <div className="py-2 text-white/70">
                    <p className="text-sm">{session.user.email}</p>
                    {isAdmin && (
                      <span className="mt-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full inline-block text-band-purple">
                        {language === 'en' ? 'Admin' : 'מנהל'}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link to="/editor" className="text-white/70 hover:text-white flex items-center text-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{menuItems.contentEditor}</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white flex items-center text-lg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{menuItems.logout}</span>
                  </button>
                </>
              ) : (
                <Link to="/auth" className="text-white/70 hover:text-white text-lg">{menuItems.login}</Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
