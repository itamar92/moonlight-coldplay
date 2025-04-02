
import { useState, useEffect } from 'react';
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

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  
  // Form state
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [content, setContent] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { toast } = useToast();

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

  useEffect(() => {
    fetchTestimonials();
  }, []);

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

  return {
    testimonials,
    loading,
    editingItem,
    author,
    role,
    content,
    avatarFile,
    setAuthor,
    setRole,
    setContent,
    setAvatarFile,
    resetForm,
    handleEdit,
    handleDelete,
    handleSubmit,
    fetchTestimonials
  };
}
