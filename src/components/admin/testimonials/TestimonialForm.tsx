
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TestimonialFormProps {
  author: string;
  setAuthor: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  editingItem: { id: string; avatar_url?: string; author: string } | null;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({
  author,
  setAuthor,
  role,
  setRole,
  content,
  setContent,
  avatarFile,
  setAvatarFile,
  editingItem,
  loading,
  handleSubmit,
  resetForm
}) => {
  return (
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
  );
};

export default TestimonialForm;
