
import React from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
  logo_url: string;
}

interface HeroContentProps {
  loading: boolean;
  content: HeroContent;
}

const HeroContent: React.FC<HeroContentProps> = ({ loading, content }) => {
  return (
    <div className="container mx-auto px-4 z-10 text-center">
      {loading ? (
        <div className="space-y-8">
          <Skeleton className="w-72 h-72 md:w-80 md:h-80 mx-auto rounded-full" />
          <Skeleton className="h-10 max-w-md mx-auto" />
          <Skeleton className="h-6 max-w-xs mx-auto" />
          <Skeleton className="h-24 max-w-2xl mx-auto" />
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-40 mx-auto md:mx-0" />
            <Skeleton className="h-12 w-40 mx-auto md:mx-0" />
          </div>
        </div>
      ) : (
        <>
          <img 
            src={content.logo_url} 
            alt="Moonlight Logo" 
            className="w-72 h-72 md:w-80 md:h-80 mx-auto mb-8 animate-pulse-glow"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow">
            <span className="text-white">{content.title}</span>
          </h1>
          <h2 className="text-xl md:text-3xl font-light mb-8 text-band-purple">
            {content.subtitle}
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {content.description}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-band-purple hover:bg-band-purple/80 text-white glow-purple" asChild>
              <a href={content.button1_link}>{content.button1_text}</a>
            </Button>
            <Button size="lg" variant="outline" className="border-band-pink text-band-pink hover:bg-band-pink/10 glow-pink" asChild>
              <a href={content.button2_link}>{content.button2_text}</a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroContent;
