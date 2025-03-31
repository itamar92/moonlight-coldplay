
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface FooterTranslations {
  companyName: string;
  description: string;
}

interface FooterData {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  translations: {
    en: FooterTranslations;
    he: FooterTranslations;
  };
}

const defaultFooterData: FooterData = {
  companyName: 'MOONLIGHT',
  description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision.',
  email: 'booking@moonlighttribute.com',
  phone: '+1 (555) 123-4567',
  location: 'Los Angeles, CA',
  socialLinks: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#'
  },
  translations: {
    en: {
      companyName: 'MOONLIGHT',
      description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision.'
    },
    he: {
      companyName: 'מונלייט',
      description: 'חווה את הקסם של המוסיקה האיקונית של קולדפליי שמבוצעת בצורה חיה עם תשוקה ודיוק.'
    }
  }
};

const FooterEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FooterData>({
    defaultValues: defaultFooterData
  });
  const [languageTab, setLanguageTab] = useState<'en' | 'he'>('en');

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('content')
          .eq('section', 'footer')
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching footer data:', error);
            toast({
              variant: "destructive",
              title: "Error fetching footer data",
              description: error.message,
            });
          }
          return;
        }

        if (data?.content) {
          // Properly type cast the JSON data to FooterData
          const parsedData = data.content as Record<string, any>;
          const footerData: FooterData = {
            companyName: parsedData.companyName || form.getValues().companyName,
            description: parsedData.description || form.getValues().description,
            email: parsedData.email || form.getValues().email,
            phone: parsedData.phone || form.getValues().phone,
            location: parsedData.location || form.getValues().location,
            socialLinks: {
              facebook: parsedData.socialLinks?.facebook || form.getValues().socialLinks.facebook,
              instagram: parsedData.socialLinks?.instagram || form.getValues().socialLinks.instagram,
              twitter: parsedData.socialLinks?.twitter || form.getValues().socialLinks.twitter,
              youtube: parsedData.socialLinks?.youtube || form.getValues().socialLinks.youtube
            },
            translations: parsedData.translations || defaultFooterData.translations
          };
          
          form.reset(footerData);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch footer data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFooterData();
  }, [toast]);

  const onSubmit = async (data: FooterData) => {
    try {
      setIsLoading(true);
      
      // Convert FooterData to a proper JSON object for Supabase
      const footerContent: Json = {
        companyName: data.companyName,
        description: data.description,
        email: data.email,
        phone: data.phone,
        location: data.location,
        socialLinks: {
          facebook: data.socialLinks.facebook,
          instagram: data.socialLinks.instagram,
          twitter: data.socialLinks.twitter,
          youtube: data.socialLinks.youtube
        },
        translations: {
          en: {
            companyName: data.translations.en.companyName,
            description: data.translations.en.description
          },
          he: {
            companyName: data.translations.he.companyName,
            description: data.translations.he.description
          }
        }
      };
      
      const { error: upsertError } = await supabase
        .from('content')
        .upsert(
          { 
            section: 'footer',
            content: footerContent,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'section' }
        );
      
      if (upsertError) throw upsertError;
      
      toast({
        title: "Success!",
        description: "Footer content has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update footer content.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <Tabs 
          defaultValue="general"
          className="w-full mt-4"
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="p-4 bg-black/30 rounded-md border border-white/10">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/10 text-white border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="bg-white/10 text-white border-white/20 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="p-4 bg-black/30 rounded-md border border-white/10">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/10 text-white border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/10 text-white border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/10 text-white border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2 border-t border-white/10">
                <h3 className="text-white text-sm font-medium mb-4">Social Media Links</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white/10 text-white border-white/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white/10 text-white border-white/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white/10 text-white border-white/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white/10 text-white border-white/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="translations" className="p-4 bg-black/30 rounded-md border border-white/10">
            <Tabs 
              value={languageTab} 
              onValueChange={(value) => setLanguageTab(value as 'en' | 'he')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="he">Hebrew</TabsTrigger>
              </TabsList>
              
              <TabsContent value="en" className="space-y-4">
                <FormField
                  control={form.control}
                  name="translations.en.companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (English)</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white/10 text-white border-white/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.en.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-white/10 text-white border-white/20 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="he" className="space-y-4">
                <FormField
                  control={form.control}
                  name="translations.he.companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (Hebrew)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          dir="rtl"
                          className="bg-white/10 text-white border-white/20" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="translations.he.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Hebrew)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          dir="rtl"
                          className="bg-white/10 text-white border-white/20 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-band-purple hover:bg-band-purple/80 text-white"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FooterEditor;
