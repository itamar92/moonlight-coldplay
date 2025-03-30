
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video } from "lucide-react";

// Sample media data
const photos = [
  { id: 1, src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", alt: "Concert photo 1", description: "Live at Starlight Arena" },
  { id: 2, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", alt: "Concert photo 2", description: "Summer Tour 2023" },
  { id: 3, src: "https://images.unsplash.com/photo-1500673922987-e212871fec22", alt: "Concert photo 3", description: "Acoustic Session" },
  { id: 4, src: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb", alt: "Concert photo 4", description: "Behind the Scenes" },
  { id: 5, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", alt: "Concert photo 5", description: "Fan Meetup" },
  { id: 6, src: "https://images.unsplash.com/photo-1500673922987-e212871fec22", alt: "Concert photo 6", description: "Live at The Paradise" },
];

const videos = [
  { 
    id: 1, 
    thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", 
    title: "Yellow - Live at Starlight Arena",
    duration: "5:42"
  },
  { 
    id: 2, 
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", 
    title: "Fix You - Acoustic Version",
    duration: "4:35"
  },
  { 
    id: 3, 
    thumbnail: "https://images.unsplash.com/photo-1500673922987-e212871fec22", 
    title: "The Scientist - Behind the Scenes",
    duration: "3:58"
  },
];

const MediaSection = () => {
  const [activeTab, setActiveTab] = useState("photos");

  return (
    <section id="media" className="py-20 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            MEDIA <span className="text-band-blue">GALLERY</span>
          </h2>
          <div className="h-1 w-20 bg-band-blue mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Relive the magic of our performances through our collection of photos and videos.
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
              {photos.map((photo) => (
                <div key={photo.id} className="relative overflow-hidden rounded-lg group">
                  <img 
                    src={photo.src} 
                    alt={photo.alt}
                    className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">{photo.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="relative overflow-hidden rounded-lg group cursor-pointer">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover brightness-75 transition-all duration-300 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
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
