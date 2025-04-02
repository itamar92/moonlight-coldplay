
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';

interface HeroHeaderProps {
  isAdmin: boolean;
  connectionError: boolean;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ isAdmin, connectionError }) => {
  return (
    <>
      {/* Connection Error Message */}
      {connectionError && (
        <div className="absolute top-16 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          Connection to database failed. Default content is being displayed.
        </div>
      )}
      
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="absolute top-20 right-4 z-20">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/40 border-band-purple text-band-purple hover:bg-black/60 flex items-center gap-2" 
            asChild
          >
            <Link to="/editor">
              <Edit size={16} />
              Edit Content
            </Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default HeroHeader;
