
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

const FooterEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FooterData>({
    defaultValues: {
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
      }
    }
  });

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
          if (error.code !== 'PGRST116') { // "Not found" error
            throw error;
          }
          // If not found, we'll use the default values
          return;
        }

        if (data?.content) {
          form.reset(data.content as FooterData);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load footer data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, [form, toast]);

  const onSubmit = async (data: FooterData) => {
    try {
      setIsLoading(true);
      
      const { error: upsertError } = await supabase
        .from('content')
        .upsert(
          { 
            section: 'footer',
            content: data,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'section' }
        );

      if (upsertError) throw upsertError;

      toast({
        title: 'Success',
        description: 'Footer content has been updated',
      });
    } catch (error) {
      console.error('Error saving footer data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save footer data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-white/20 pb-2">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
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
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a brief description about your band"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white border-b border-white/20 pb-2">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
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
                    <FormLabel className="text-white">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (123) 456-7890" {...field} />
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
                    <FormLabel className="text-white">Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-white/20 pb-2">Social Media Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/your-page" {...field} />
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
                    <FormLabel className="text-white">Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/your-handle" {...field} />
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
                    <FormLabel className="text-white">Twitter</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/your-handle" {...field} />
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
                    <FormLabel className="text-white">YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/channel/your-channel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-band-purple hover:bg-band-purple/80 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Footer Content'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default FooterEditor;
