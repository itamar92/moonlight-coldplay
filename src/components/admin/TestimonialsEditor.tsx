
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar_url?: string;
  order: number;
}

const TestimonialsEditor = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  
  // Form state
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order', { ascending: true });
        
      if (error) throw error;
      
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load testimonials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setAuthor('');
    setRole('');
    setContent('');
    setAvatarFile(null);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setAuthor(item.author);
    setRole(item.role);
    setContent(item.content);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTestimonials(testimonials.filter(item => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete testimonial.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author || !role || !content) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let avatarUrl = editingItem?.avatar_url || '';
      
      // Upload new avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('content')
          .upload(fileName, avatarFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('content')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrlData.publicUrl;
      }
      
      if (editingItem) {
        // Update existing testimonial
        const { error } = await supabase
          .from('testimonials')
          .update({
            author,
            role,
            content,
            avatar_url: avatarUrl || editingItem.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
          
        if (error) throw error;
        
        setTestimonials(testimonials.map(item => 
          item.id === editingItem.id 
            ? { ...item, author, role, content, avatar_url: avatarUrl || item.avatar_url } 
            : item
        ));
      } else {
        // Create new testimonial
        const newItem = {
          author,
          role,
          content,
          avatar_url: avatarUrl,
          order: testimonials.length + 1
        };
        
        const { error, data } = await supabase
          .from('testimonials')
          .insert([newItem])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTestimonials([...testimonials, data[0]]);
        }
      }
      
      resetForm();
      
      toast({
        title: 'Success',
        description: `Testimonial ${editingItem ? 'updated' : 'added'} successfully!`,
      });
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'add'} testimonial.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-black/30 rounded-lg border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">
          {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="author" className="text-white">Author Name</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-black/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Role/Position</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-black/50"
              required
              placeholder="Fan, Music Critic, etc."
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content" className="text-white">Testimonial Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-black/50 min-h-[100px]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="avatar" className="text-white">Avatar Image (Optional)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
            className="bg-black/50"
          />
          {editingItem?.avatar_url && (
            <div className="mt-2 h-16 w-16 rounded-full bg-black/30 overflow-hidden">
              <img 
                src={editingItem.avatar_url}
                alt={`${editingItem.author} avatar`}
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
            {loading ? 'Saving...' : (editingItem ? 'Update Testimonial' : 'Add Testimonial')}
          </Button>
        </div>
      </form>
      
      {/* Testimonials list */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <p>No testimonials added yet.</p>
          </div>
        ) : (
          testimonials.map((item) => (
            <div key={item.id} className="p-6 border border-white/10 rounded-lg bg-black/30 relative group">
              <div className="flex items-start">
                {item.avatar_url && (
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={item.avatar_url}
                      alt={`${item.author} avatar`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-white/90 italic mb-3">"{item.content}"</p>
                  <div>
                    <h4 className="text-white font-medium">{item.author}</h4>
                    <p className="text-sm text-white/60">{item.role}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(item)}
                    className="bg-black/50 text-white hover:bg-black/70 mr-1"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="bg-black/50 text-white hover:bg-red-900/70"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialsEditor;
