
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Trash2, Star } from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
};

interface TranslatedContent {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const TestimonialsEditor = () => {
  const { toast } = useToast();
  
  const [content, setContent] = useState<{
    en: TranslatedContent;
    he: TranslatedContent;
  }>({
    en: {
      title: "FAN TESTIMONIALS",
      subtitle: "Hear what our fans have to say about the Moonlight experience.",
      testimonials: []
    },
    he: {
      title: "המלצות מעריצים",
      subtitle: "שמעו מה המעריצים שלנו אומרים על החוויה של מונלייט.",
      testimonials: []
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTestimonialsContent = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('content')
          .select('content')
          .eq('section', 'testimonials')
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error('Error fetching testimonials content:', error);
          }
          setIsLoading(false);
          return;
        }
        
        if (data?.content) {
          setContent(JSON.parse(JSON.stringify(data.content)));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing testimonials content:', error);
        setIsLoading(false);
      }
    };
    
    fetchTestimonialsContent();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const { data: existingData, error: checkError } = await supabase
        .from('content')
        .select('id')
        .eq('section', 'testimonials')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('content')
          .update({
            content: JSON.parse(JSON.stringify(content)),
            updated_at: new Date().toISOString()
          })
          .eq('section', 'testimonials');
      } else {
        // Insert new record
        result = await supabase
          .from('content')
          .insert({
            section: 'testimonials',
            content: JSON.parse(JSON.stringify(content)),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Testimonials saved",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving testimonials:', error);
      toast({
        variant: "destructive",
        title: "Error saving testimonials",
        description: "There was a problem saving your changes. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTestimonial = (language: 'en' | 'he') => {
    const newId = Math.max(0, ...content[language].testimonials.map(t => t.id)) + 1;
    
    setContent({
      ...content,
      [language]: {
        ...content[language],
        testimonials: [
          ...content[language].testimonials,
          {
            id: newId,
            name: language === 'en' ? "New Testimonial" : "המלצה חדשה",
            location: language === 'en' ? "City, Country" : "עיר, מדינה",
            rating: 5,
            text: language === 'en' ? "Enter testimonial text here" : "הכנס טקסט המלצה כאן"
          }
        ]
      }
    });
  };

  const removeTestimonial = (language: 'en' | 'he', id: number) => {
    setContent({
      ...content,
      [language]: {
        ...content[language],
        testimonials: content[language].testimonials.filter(t => t.id !== id)
      }
    });
  };

  const updateTestimonial = (language: 'en' | 'he', id: number, field: keyof Testimonial, value: any) => {
    setContent({
      ...content,
      [language]: {
        ...content[language],
        testimonials: content[language].testimonials.map(t => 
          t.id === id ? { ...t, [field]: field === 'rating' ? Number(value) : value } : t
        )
      }
    });
  };

  const updateContentField = (language: 'en' | 'he', field: keyof TranslatedContent, value: any) => {
    if (field !== 'testimonials') {
      setContent({
        ...content,
        [language]: {
          ...content[language],
          [field]: value
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-3 text-white">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="english" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="hebrew">Hebrew (עברית)</TabsTrigger>
        </TabsList>
        
        {/* English Content */}
        <TabsContent value="english" className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="en-title" className="text-white mb-2 block">Section Title</Label>
              <Input
                id="en-title"
                value={content.en.title}
                onChange={(e) => updateContentField('en', 'title', e.target.value)}
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="en-subtitle" className="text-white mb-2 block">Section Subtitle</Label>
              <Input
                id="en-subtitle"
                value={content.en.subtitle}
                onChange={(e) => updateContentField('en', 'subtitle', e.target.value)}
                className="bg-black/30 border-white/20 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Testimonials</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="border-band-purple text-band-purple hover:bg-band-purple/10"
                onClick={() => addTestimonial('en')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </div>
            
            {content.en.testimonials.length === 0 ? (
              <p className="text-white/60 text-center py-8">No testimonials yet. Add your first one!</p>
            ) : (
              <div className="space-y-4">
                {content.en.testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-black/30 border-white/20">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Label htmlFor={`name-${testimonial.id}`} className="text-white">Name</Label>
                          <Input
                            id={`name-${testimonial.id}`}
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial('en', testimonial.id, 'name', e.target.value)}
                            className="bg-black/30 border-white/20 text-white"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => removeTestimonial('en', testimonial.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label htmlFor={`location-${testimonial.id}`} className="text-white">Location</Label>
                        <Input
                          id={`location-${testimonial.id}`}
                          value={testimonial.location}
                          onChange={(e) => updateTestimonial('en', testimonial.id, 'location', e.target.value)}
                          className="bg-black/30 border-white/20 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`rating-${testimonial.id}`} className="text-white">Rating (1-5)</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`p-1 ${rating <= testimonial.rating ? 'text-band-pink' : 'text-white/30'}`}
                              onClick={() => updateTestimonial('en', testimonial.id, 'rating', rating)}
                            >
                              <Star className={`h-5 w-5 ${rating <= testimonial.rating ? 'fill-band-pink' : ''}`} />
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`text-${testimonial.id}`} className="text-white">Testimonial Text</Label>
                        <Textarea
                          id={`text-${testimonial.id}`}
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial('en', testimonial.id, 'text', e.target.value)}
                          className="bg-black/30 border-white/20 text-white min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Hebrew Content */}
        <TabsContent value="hebrew" className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="he-title" className="text-white mb-2 block">Section Title (כותרת)</Label>
              <Input
                id="he-title"
                value={content.he.title}
                onChange={(e) => updateContentField('he', 'title', e.target.value)}
                className="bg-black/30 border-white/20 text-white text-right"
                dir="rtl"
              />
            </div>
            
            <div>
              <Label htmlFor="he-subtitle" className="text-white mb-2 block">Section Subtitle (תת כותרת)</Label>
              <Input
                id="he-subtitle"
                value={content.he.subtitle}
                onChange={(e) => updateContentField('he', 'subtitle', e.target.value)}
                className="bg-black/30 border-white/20 text-white text-right"
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Testimonials (המלצות)</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="border-band-purple text-band-purple hover:bg-band-purple/10"
                onClick={() => addTestimonial('he')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                הוסף המלצה
              </Button>
            </div>
            
            {content.he.testimonials.length === 0 ? (
              <p className="text-white/60 text-center py-8">אין המלצות עדיין. הוסף את הראשונה!</p>
            ) : (
              <div className="space-y-4">
                {content.he.testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="bg-black/30 border-white/20">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Label htmlFor={`he-name-${testimonial.id}`} className="text-white">Name (שם)</Label>
                          <Input
                            id={`he-name-${testimonial.id}`}
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial('he', testimonial.id, 'name', e.target.value)}
                            className="bg-black/30 border-white/20 text-white text-right"
                            dir="rtl"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => removeTestimonial('he', testimonial.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label htmlFor={`he-location-${testimonial.id}`} className="text-white">Location (מיקום)</Label>
                        <Input
                          id={`he-location-${testimonial.id}`}
                          value={testimonial.location}
                          onChange={(e) => updateTestimonial('he', testimonial.id, 'location', e.target.value)}
                          className="bg-black/30 border-white/20 text-white text-right"
                          dir="rtl"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`he-rating-${testimonial.id}`} className="text-white">Rating (דירוג 1-5)</Label>
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`p-1 ${rating <= testimonial.rating ? 'text-band-pink' : 'text-white/30'}`}
                              onClick={() => updateTestimonial('he', testimonial.id, 'rating', rating)}
                            >
                              <Star className={`h-5 w-5 ${rating <= testimonial.rating ? 'fill-band-pink' : ''}`} />
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`he-text-${testimonial.id}`} className="text-white">Testimonial Text (טקסט)</Label>
                        <Textarea
                          id={`he-text-${testimonial.id}`}
                          value={testimonial.text}
                          onChange={(e) => updateTestimonial('he', testimonial.id, 'text', e.target.value)}
                          className="bg-black/30 border-white/20 text-white min-h-[100px] text-right"
                          dir="rtl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-band-purple hover:bg-band-purple/90"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default TestimonialsEditor;
