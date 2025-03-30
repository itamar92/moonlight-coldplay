
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Absolutely amazing! I've seen Coldplay live, and these guys capture their energy and sound perfectly. Can't wait for their next show!"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Boston, MA",
    rating: 5,
    text: "Moonlight brings the magic of Coldplay to life in a way that feels both authentic and fresh. Their rendition of 'Fix You' had me in tears."
  },
  {
    id: 3,
    name: "Jessica Williams",
    location: "Austin, TX",
    rating: 5,
    text: "I've been to three of their shows already, and each one has been better than the last. Their passion for the music shines through in every performance."
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-band-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-band-purple/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-band-pink/10 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
            FAN <span className="text-band-pink">TESTIMONIALS</span>
          </h2>
          <div className="h-1 w-20 bg-band-pink mx-auto mb-8"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Hear what our fans have to say about the Moonlight experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-black/50 border-band-pink/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-band-pink fill-band-pink mr-1" />
                  ))}
                </div>
                <p className="text-white/90 italic mb-6">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-white font-medium">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
