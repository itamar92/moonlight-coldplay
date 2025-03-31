import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Image, Video, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  duration?: string;
  order: number;
}

const MediaEditor = () => {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('order', { ascending: true });
        
      if (error) throw error;
      
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
      console.error('Error fetching media:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load media content.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setVideoUrl('');
    setVideoDuration('');
    setVideoThumbnailFile(null);
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    
    if (item.type === 'video') {
      setVideoUrl(item.url);
      setVideoDuration(item.duration || '');
      setActiveTab('videos');
    } else {
      setActiveTab('photos');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      if (activeTab === 'photos') {
        setPhotos(photos.filter(photo => photo.id !== id));
      } else {
        setVideos(videos.filter(video => video.id !== id));
      }
      
      toast({
        title: 'Success',
        description: 'Media item deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete media item.',
      });
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile && !editingItem) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image to upload.',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = editingItem?.url || '';
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `photo-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('content')
          .upload(fileName, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
      if (editingItem) {
        const { error } = await supabase
          .from('media')
          .update({
            title,
            description,
            url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        setPhotos(photos.map(photo => 
          photo.id === editingItem.id 
            ? { ...photo, title, description, url: imageUrl } 
            : photo
        ));
      } else {
        const newItem = {
          type: 'photo' as const,
          title,
          description,
          url: imageUrl,
          order: photos.length + 1
        };
        
        const { error, data } = await supabase
          .from('media')
          .insert([newItem])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPhotos([...photos, {...data[0], type: 'photo' as const}]);
        }
      }
      
      resetForm();
      
      toast({
        title: 'Success',
        description: `Photo ${editingItem ? 'updated' : 'added'} successfully!`,
      });
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'add'} photo.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a YouTube video URL.',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let thumbnailUrl = editingItem?.thumbnail || '';
      
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      
      if (!thumbnailUrl && !videoThumbnailFile) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      if (videoThumbnailFile) {
        const fileExt = videoThumbnailFile.name.split('.').pop();
        const fileName = `video-thumb-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('content')
          .upload(fileName, videoThumbnailFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);
          
        thumbnailUrl = publicUrlData.publicUrl;
      }
      
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      if (editingItem) {
        const { error } = await supabase
          .from('media')
          .update({
            title,
            description,
            url: embedUrl,
            thumbnail: thumbnailUrl,
            duration: videoDuration,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        setVideos(videos.map(video => 
          video.id === editingItem.id 
            ? { ...video, title, description, url: embedUrl, thumbnail: thumbnailUrl, duration: videoDuration } 
            : video
        ));
      } else {
        const newItem = {
          type: 'video' as const,
          title,
          description,
          url: embedUrl,
          thumbnail: thumbnailUrl,
          duration: videoDuration,
          order: videos.length + 1
        };
        
        const { error, data } = await supabase
          .from('media')
          .insert([newItem])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVideos([...videos, {...data[0], type: 'video' as const}]);
        }
      }
      
      resetForm();
      
      toast({
        title: 'Success',
        description: `Video ${editingItem ? 'updated' : 'added'} successfully!`,
      });
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'add'} video. ${error instanceof Error ? error.message : ''}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'photos' | 'videos')}>
        <TabsList className="mb-8">
          <TabsTrigger value="photos" className="flex items-center">
            <Image size={18} className="mr-2" /> Photos
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center">
            <Video size={18} className="mr-2" /> Videos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="photos" className="space-y-8">
          <form onSubmit={handleSubmitPhoto} className="space-y-4 p-6 bg-black/30 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingItem ? 'Edit Photo' : 'Add New Photo'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="photoTitle" className="text-white">Title</Label>
                <Input
                  id="photoTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photoDescription" className="text-white">Description</Label>
                <Input
                  id="photoDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photoFile" className="text-white">Photo File</Label>
              <Input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                className="bg-black/50"
                required={!editingItem}
              />
              {editingItem?.url && (
                <div className="mt-2 h-20 w-20 bg-black/30 rounded overflow-hidden">
                  <img 
                    src={editingItem.url}
                    alt="Current photo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-band-purple hover:bg-band-purple/80"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingItem ? 'Update Photo' : 'Add Photo')}
              </Button>
            </div>
          </form>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group overflow-hidden rounded-lg border border-white/10">
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="font-medium text-white">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-sm text-white/70">{photo.description}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(photo)}
                    className="bg-black/50 text-white hover:bg-black/70 mr-1"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(photo.id)}
                    className="bg-black/50 text-white hover:bg-red-900/70"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-8">
          <form onSubmit={handleSubmitVideo} className="space-y-4 p-6 bg-black/30 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingItem ? 'Edit Video' : 'Add New Video'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoTitle" className="text-white">Title</Label>
                <Input
                  id="videoTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="videoDuration" className="text-white">Duration (e.g. "4:32")</Label>
                <Input
                  id="videoDuration"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="bg-black/50"
                  placeholder="3:45"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoDescription" className="text-white">Description</Label>
              <Input
                id="videoDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-white">YouTube URL</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-black/50"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="text-xs text-white/50">Enter the YouTube URL (e.g., https://www.youtube.com/watch?v=abcdef123)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoThumbnail" className="text-white">Custom Thumbnail (Optional)</Label>
              <Input
                id="videoThumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setVideoThumbnailFile(e.target.files[0])}
                className="bg-black/50"
              />
              <p className="text-xs text-white/50">Leave empty to use YouTube's thumbnail</p>
              
              {editingItem?.thumbnail && (
                <div className="mt-2 h-20 w-36 bg-black/30 rounded overflow-hidden">
                  <img 
                    src={editingItem.thumbnail}
                    alt="Current thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-band-purple hover:bg-band-purple/80"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingItem ? 'Update Video' : 'Add Video')}
              </Button>
            </div>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="relative group overflow-hidden rounded-lg border border-white/10">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-band-pink/80 flex items-center justify-center">
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
                <div className="p-4 bg-black/90">
                  <h3 className="font-medium text-white">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-white/70 mt-1">{video.description}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(video)}
                    className="bg-black/50 text-white hover:bg-black/70 mr-1"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(video.id)}
                    className="bg-black/50 text-white hover:bg-red-900/70"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaEditor;
