
import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/context/LanguageContext';
import { Languages } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-transparent flex items-center p-0">
          <Languages className="h-4 w-4 mr-1" />
          {language === 'en' ? 'EN' : 'עב'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-band-dark border-band-purple/30 text-white">
        <DropdownMenuItem 
          className={`text-white hover:text-white hover:bg-white/10 cursor-pointer ${language === 'en' ? 'bg-white/10' : ''}`}
          onClick={() => setLanguage('en')}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`text-white hover:text-white hover:bg-white/10 cursor-pointer ${language === 'he' ? 'bg-white/10' : ''}`}
          onClick={() => setLanguage('he')}
        >
          עברית (Hebrew)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
