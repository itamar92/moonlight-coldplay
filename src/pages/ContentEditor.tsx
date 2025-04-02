import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Home } from 'lucide-react';
import HeroEditor from '../components/admin/HeroEditor';
import ShowsEditor from '../components/admin/ShowsEditor';
import MediaEditor from '../components/admin/MediaEditor';
import TestimonialsEditor from '../components/admin/TestimonialsEditor';
import FooterEditor from '../components/admin/FooterEditor';

const ContentEditor = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(profileData?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-band-dark flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-3 text-white">Checking admin status...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-band-dark">
      <div className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Content Editor</h1>
          <Button variant="outline" className="border-band-pink text-band-pink hover:bg-band-pink/10" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home size={18} />
              Back to Homepage
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero">
            <Card className="bg-black/50 border-band-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Edit Hero Section</CardTitle>
              </CardHeader>
              <CardContent>
                <HeroEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shows">
            <Card className="bg-black/50 border-band-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Manage Shows</CardTitle>
              </CardHeader>
              <CardContent>
                <ShowsEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card className="bg-black/50 border-band-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Manage Media</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testimonials">
            <Card className="bg-black/50 border-band-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Manage Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <TestimonialsEditor />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="footer">
            <Card className="bg-black/50 border-band-purple/20">
              <CardHeader>
                <CardTitle className="text-white">Edit Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <FooterEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentEditor;
