import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { fetchMedia, MediaItem } from '@/lib/googleSheets';
import { SparklesCore } from '@/components/ui/sparkles';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';

const VideoCard = ({ video }: { video: MediaItem }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`${video.url}?autoplay=1`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <h3 className="text-white font-medium text-lg">{video.title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg group">
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover brightness-75 transition-all duration-300 group-hover:brightness-100"
        />
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <div className="w-16 h-16 rounded-full bg-band-pink/80 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="white"/>
            </svg>
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-4 bg-black/50 backdrop-blur-sm">
        <h3 className="text-white font-medium text-lg">{video.title}</h3>
      </div>
    </div>
  );
};

const MediaSection = () => {
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const items = await fetchMedia();
        const photosData = items.filter((item) => item.type === 'photo');
        const videosData = items.filter((item) => item.type === 'video');

        setPhotos(photosData.length > 0 ? photosData : getDefaultPhotos());
        setVideos(videosData.length > 0 ? videosData : getDefaultVideos());
      } catch (error) {
        console.error('Error fetching media:', error);
        setPhotos(getDefaultPhotos());
        setVideos(getDefaultVideos());
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, []);

  const getDefaultPhotos = (): MediaItem[] => [
    { id: '1', type: 'photo', url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", title: "Concert photo 1", description: "Live at Starlight Arena", order: 1 },
    { id: '2', type: 'photo', url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", title: "Concert photo 2", description: "Summer Tour 2023", order: 2 },
    { id: '3', type: 'photo', url: "https://images.unsplash.com/photo-1500673922987-e212871fec22", title: "Concert photo 3", description: "Acoustic Session", order: 3 },
    { id: '4', type: 'photo', url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb", title: "Concert photo 4", description: "Behind the Scenes", order: 4 },
    { id: '5', type: 'photo', url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", title: "Concert photo 5", description: "Fan Meetup", order: 5 },
    { id: '6', type: 'photo', url: "https://images.unsplash.com/photo-1500673922987-e212871fec22", title: "Concert photo 6", description: "Live at The Paradise", order: 6 },
  ];
  
  const getDefaultVideos = (): MediaItem[] => [
    { id: '1', type: 'video', url: "https://www.youtube.com/embed/yKNxeF4KMsY", thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", title: "Yellow - Live at Starlight Arena", duration: "5:42", order: 1 },
    { id: '2', type: 'video', url: "https://www.youtube.com/embed/yKNxeF4KMsY", thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", title: "Fix You - Acoustic Version", duration: "4:35", order: 2 },
    { id: '3', type: 'video', url: "https://www.youtube.com/embed/yKNxeF4KMsY", thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22", title: "The Scientist - Behind the Scenes", duration: "3:58", order: 3 },
  ];

  const texts = {
    mediaText: language === 'en' ? 'MEDIA' : ' גלריית',
    mediaText2: language === 'en' ? 'GALLERY' : 'תמונות',
    paragraphText: language === 'en' ? 'Relive the magic of our performances through our collection of photos and videos.' : 'תמונות מהופעות חיות'
  };

  if (loading) {
    return (
      <section id="media" className="py-20 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
              {texts.mediaText} <span className="text-band-blue">{texts.mediaText2}</span>
            </h2>
            <div className="h-1 w-20 bg-band-blue mx-auto mb-8"></div>
          </div>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-blue border-r-transparent"></div>
            <p className="mt-4 text-white/70">Loading media...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="media" className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="media-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={80}
          particleColor="#9b5de5"
          className="h-full w-full"
          speed={2}
        />
      </div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl z-[1]"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl z-[1]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
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
            <ThreeDPhotoCarousel images={photos.map(photo => photo.url)} />
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default MediaSection;
