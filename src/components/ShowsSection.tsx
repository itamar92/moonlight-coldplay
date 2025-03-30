
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

// Sample upcoming shows data
const upcomingShows = [
  {
    id: 1,
    date: "June 15, 2024",
    venue: "Starlight Arena",
    location: "Los Angeles, CA",
    ticketLink: "#"
  },
  {
    id: 2,
    date: "June 23, 2024",
    venue: "The Paradise",
    location: "Boston, MA",
    ticketLink: "#"
  },
  {
    id: 3,
    date: "July 8, 2024",
    venue: "Cosmic Club",
    location: "Austin, TX",
    ticketLink: "#"
  },
  {
    id: 4,
    date: "July 19, 2024",
    venue: "The Fillmore",
    location: "San Francisco, CA",
    ticketLink: "#"
  },
];

const ShowsSection = () => {
  return (
    <section id="shows" className="py-20 bg-gradient-to-b from-band-dark to-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cosmic"></div>
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-band-blue/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-band-purple/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            UPCOMING <span className="text-band-purple">SHOWS</span>
          </h2>
          <div className="h-1 w-20 bg-band-purple mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Don't miss your chance to experience the magic of Coldplay's music live. Check our tour schedule and grab your tickets before they're gone!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingShows.map((show) => (
            <Card key={show.id} className="bg-black/50 border-band-purple/20 backdrop-blur-sm overflow-hidden group hover:border-band-purple transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4 text-band-purple">
                  <Calendar size={18} className="mr-2" />
                  <span className="text-sm font-medium">{show.date}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{show.venue}</h3>
                <div className="flex items-center mb-6 text-white/70">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{show.location}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-band-purple text-band-purple hover:bg-band-purple hover:text-white transition-all"
                >
                  GET TICKETS
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-band-blue text-band-blue hover:bg-band-blue/10 glow-blue"
          >
            VIEW ALL SHOWS
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShowsSection;
