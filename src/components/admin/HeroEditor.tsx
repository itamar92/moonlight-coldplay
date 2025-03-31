
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
  logo_url: string;
}

interface MultilingualHeroContent {
  en: HeroContent;
  he: HeroContent;
}

const defaultContent: MultilingualHeroContent = {
  en: {
    title: 'MOONLIGHT',
    subtitle: 'COLDPLAY TRIBUTE BAND',
    description: 'Experience the magic of Coldplay\'s iconic music performed live with passion and precision. Join us on a musical journey through the stars.',
    button1_text: 'UPCOMING SHOWS',
    button1_link: '#shows',
    button2_text: 'FOLLOW US',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png'
  },
  he: {
    title: 'מונלייט',
    subtitle: 'להקת מחווה לקולדפליי',
    description: 'חווה את הקסם של המוזיקה האיקונית של קולדפליי בהופעה חיה עם תשוקה ודיוק. הצטרף אלינו למסע מוזיקלי בין הכוכבים.',
    button1_text: 'הופעות קרובות',
    button1_link: '#shows',
    button2_text: 'עקבו אחרינו',
    button2_link: '#',
    logo_url: '/lovable-uploads/1dd6733a-cd1d-4727-bc54-7d4a3885c0c5.png'
  }
};

// Helper function to validate if an object is a valid HeroContent
const isValidHeroContent = (obj: any): obj is HeroContent => {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    !Array.isArray(obj) &&
    typeof obj.title === 'string' &&
    typeof obj.subtitle === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.button1_text === 'string' &&
    typeof obj.button1_link === 'string' &&
    typeof obj.button2_text === 'string' &&
    typeof obj.button2_link === 'string' &&
    typeof obj.logo_url === 'string'
  );
};

// Helper function to validate multilingual content
const isValidMultilingualContent = (obj: any): obj is MultilingualHeroContent => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    isValidHeroContent(obj.en) &&
    isValidHeroContent(obj.he)
  );
};

const HeroEditor = () => {
  const [content, setContent] = useState<MultilingualHeroContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>('en');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('section', 'hero')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching hero content:', error);
          return;
        }
        
        if (data && data.content) {
          // Safely handle the content data with proper type checking
          const heroContentData = data.content as Record<string, any>;
          
          // Check if we have multilingual content or legacy single-language content
          if (isValidMultilingualContent(heroContentData)) {
            setContent(heroContentData);
          } else if (isValidHeroContent(heroContentData)) {
            // Convert legacy format to multilingual format
            setContent({
              en: heroContentData as HeroContent,
              he: defaultContent.he
            });
          } else {
            console.error('Hero content has invalid structure:', heroContentData);
          }
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [currentLanguage]: {
        ...prev[currentLanguage],
        [name]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let logoUrl = content[currentLanguage].logo_url;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `hero-logo-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('content')
          .upload(fileName, logoFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);
          
        logoUrl = publicUrlData.publicUrl;
        
        // Update logo URL for both languages
        setContent(prev => ({
          en: { ...prev.en, logo_url: logoUrl },
          he: { ...prev.he, logo_url: logoUrl }
        }));
      }
      
      const updatedContent = {
        ...content,
        [currentLanguage]: {
          ...content[currentLanguage],
          logo_url: logoUrl
        }
      };
      
      const { error } = await supabase
        .from('content')
        .upsert({
          section: 'hero',
          content: updatedContent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section'
        });
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Hero content has been updated!',
      });
    } catch (error) {
      console.error('Error updating hero content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update hero content. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as 'en' | 'he')}>
        <TabsList className="mb-4">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="he">עברית (Hebrew)</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={content[currentLanguage].title}
                  onChange={handleInputChange}
                  className="bg-black/50"
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-white">Subtitle</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={content[currentLanguage].subtitle}
                  onChange={handleInputChange}
                  className="bg-black/50"
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={content[currentLanguage].description}
                onChange={handleInputChange}
                className="bg-black/50 min-h-[100px]"
                dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button1_text" className="text-white">Button 1 Text</Label>
                <Input
                  id="button1_text"
                  name="button1_text"
                  value={content[currentLanguage].button1_text}
                  onChange={handleInputChange}
                  className="bg-black/50"
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button1_link" className="text-white">Button 1 Link</Label>
                <Input
                  id="button1_link"
                  name="button1_link"
                  value={content[currentLanguage].button1_link}
                  onChange={handleInputChange}
                  className="bg-black/50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button2_text" className="text-white">Button 2 Text</Label>
                <Input
                  id="button2_text"
                  name="button2_text"
                  value={content[currentLanguage].button2_text}
                  onChange={handleInputChange}
                  className="bg-black/50"
                  dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button2_link" className="text-white">Button 2 Link</Label>
                <Input
                  id="button2_link"
                  name="button2_link"
                  value={content[currentLanguage].button2_link}
                  onChange={handleInputChange}
                  className="bg-black/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-white">Logo Image</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-black/50"
                  />
                </div>
                {content[currentLanguage].logo_url && (
                  <div className="h-16 w-16 bg-black/30 rounded overflow-hidden">
                    <img 
                      src={content[currentLanguage].logo_url}
                      alt="Current logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/70 mt-1">
                The logo will be shared between both languages.
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-band-purple hover:bg-band-purple/80" 
            disabled={loading}
          >
            {loading ? 'Saving...' : `Save ${currentLanguage === 'en' ? 'English' : 'Hebrew'} Content`}
          </Button>
        </form>
      </Tabs>
    </div>
  );
};

export default HeroEditor;
