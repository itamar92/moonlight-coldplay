import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  duration?: string;
}

const MediaSection = () => {
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .order('order', { ascending: true });
          
        if (error) {
          console.error('Error fetching media:', error);
          return;
        }
        
        // Filter media into photos and videos with proper type casting
        const photosData = data?.filter(item => item.type === 'photo').map(item => ({
          ...item,
          type: 'photo' as const
        })) || [];
        
        const videosData = data?.filter(item => item.type === 'video').map(item => ({
          ...item,
          type: 'video' as const
        })) || [];
        
        setPhotos(photosData);
        setVideos(videosData);
      } catch (error) {
        console.error('Error in media fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedia();
  }, []);

  // Fallback to sample data if no database data is available
  const defaultPhotos = [
    { id: '1', type: 'photo' as const, url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", title: "Concert photo 1", description: "Live at Starlight Arena" },
    { id: '2', type: 'photo' as const, url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", title: "Concert photo 2", description: "Summer Tour 2023" },
    { id: '3', type: 'photo' as const, url: "https://images.unsplash.com/photo-1500673922987-e212871fec22", title: "Concert photo 3", description: "Acoustic Session" },
    { id: '4', type: 'photo' as const, url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb", title: "Concert photo 4", description: "Behind the Scenes" },
    { id: '5', type: 'photo' as const, url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", title: "Concert photo 5", description: "Fan Meetup" },
    { id: '6', type: 'photo' as const, url: "https://images.unsplash.com/photo-1500673922987-e212871fec22", title: "Concert photo 6", description: "Live at The Paradise" },
  ];
  
  const defaultVideos = [
    { 
      id: '1', 
      type: 'video' as const, 
      url: "https://www.youtube.com/embed/yKNxeF4KMsY", 
      thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", 
      title: "Yellow - Live at Starlight Arena",
      duration: "5:42"
    },
    { 
      id: '2', 
      type: 'video' as const,
      url: "https://www.youtube.com/embed/yKNxeF4KMsY", 
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
      title: "Fix You - Acoustic Version",
      duration: "4:35"
    },
    { 
      id: '3', 
      type: 'video' as const,
      url: "https://www.youtube.com/embed/yKNxeF4KMsY", 
      thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22", 
      title: "The Scientist - Behind the Scenes",
      duration: "3:58"
    },
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;
  const displayVideos = videos.length > 0 ? videos : defaultVideos;
  const texts = {
    mediaText: language === 'en' ? 'MEDIA' : ' גלריית',
    mediaText2: language === 'en' ? 'GALLERY' : 'תמונות',
    paragraphText: language === 'en' ? 'Relive the magic of our performances through our collection of photos and videos.' : 'תמונות מהופעות חיות'

  };

  return (
    <section id="media" className="py-20 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
          {texts.mediaText} <span className="text-band-blue">{texts.mediaText2}</span>
          </h2>
          <div className="h-1 w-20 bg-band-blue mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            {texts.paragraphText}
          </p>
        </div>
        
        <Tabs defaultValue="photos" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-black/50 border border-white/10">
              <TabsTrigger 
                value="photos" 
                className={`data-[state=active]:bg-band-blue data-[state=active]:text-white ${activeTab === 'photos' ? 'text-glow' : ''}`}
              >
                <Image size={18} className="mr-2" /> Photos
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className={`data-[state=active]:bg-band-pink data-[state=active]:text-white ${activeTab === 'videos' ? 'text-glow' : ''}`}
              >
                <Video size={18} className="mr-2" /> Videos
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="photos" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayPhotos.map((photo) => (
                <div key={photo.id} className="relative overflow-hidden rounded-lg group">
                  <img 
                    src={photo.url} 
                    alt={photo.title}
                    className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">{photo.description || photo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVideos.map((video) => (
                <div key={video.id} className="relative overflow-hidden rounded-lg group">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover brightness-75 transition-all duration-300 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer"
                         onClick={() => {
                           const iframe = document.createElement('iframe');
                           iframe.src = video.url;
                           iframe.width = '100%';
                           iframe.height = '100%';
                           iframe.frameBorder = '0';
                           iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                           iframe.allowFullscreen = true;
                           
                           const container = document.getElementById(`video-container-${video.id}`);
                           if (container) {
                             container.innerHTML = '';
                             container.appendChild(iframe);
                           }
                         }}
                    >
                      <div className="w-16 h-16 rounded-full bg-band-pink/80 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      {video.duration}
                    </div>
                  </div>
                  <div id={`video-container-${video.id}`} className="hidden aspect-video w-full bg-black"></div>
                  <div className="p-4 bg-black/50 backdrop-blur-sm">
                    <h3 className="text-white font-medium text-lg">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default MediaSection;
