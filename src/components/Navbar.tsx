
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

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  
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
            <Link to="/admin" className="text-band-purple hover:text-band-purple/80 transition-colors flex items-center">
              <span>ADMIN</span>
              {/* Admin badge */}
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full">ADMIN</span>
            </Link>
          )}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white/70 hover:text-white flex items-center">
                  <UserRoundIcon className="h-4 w-4 mr-1" />
                  ACCOUNT
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-band-dark border-band-purple/30 text-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>My Account</span>
                    <span className="text-xs text-white/60">{session.user.email}</span>
                    {isAdmin && (
                      <span className="mt-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full w-fit text-band-purple">
                        Admin
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
                      <span>Content Editor</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <Link to="/admin" className="text-band-purple hover:text-band-purple/80 transition-colors text-lg flex items-center">
                  <span>ADMIN</span>
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full">ADMIN</span>
                </Link>
              )}
              
              {session ? (
                <>
                  <div className="py-2 text-white/70">
                    <p className="text-sm">{session.user.email}</p>
                    {isAdmin && (
                      <span className="mt-1 px-1.5 py-0.5 text-xs bg-band-purple/20 rounded-full inline-block text-band-purple">
                        Admin
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <Link to="/editor" className="text-white/70 hover:text-white flex items-center text-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Content Editor</span>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white flex items-center text-lg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
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
