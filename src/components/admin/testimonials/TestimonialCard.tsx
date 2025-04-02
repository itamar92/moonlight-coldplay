
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar_url?: string;
  order: number;
}

interface TestimonialCardProps {
  item: Testimonial;
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="p-6 border border-white/10 rounded-lg bg-black/30 relative group">
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
            onClick={() => onEdit(item)}
            className="bg-black/50 text-white hover:bg-black/70 mr-1"
          >
            <Edit size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(item.id)}
            className="bg-black/50 text-white hover:bg-red-900/70"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
