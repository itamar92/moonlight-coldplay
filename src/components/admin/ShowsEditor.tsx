
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Ticket, Clock, Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Show {
  id: string;
  date: string;
  venue: string;
  location: string;
  ticket_link: string;
  is_published: boolean;
}

const ShowsEditor = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  
  // Form state
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [ticketLink, setTicketLink] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      setShows(data || []);
    } catch (error) {
      console.error('Error fetching shows:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load shows. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingShow(null);
    setDate('');
    setVenue('');
    setLocation('');
    setTicketLink('');
    setIsPublished(true);
  };

  const handleEdit = (show: Show) => {
    setEditingShow(show);
    setDate(show.date);
    setVenue(show.venue);
    setLocation(show.location);
    setTicketLink(show.ticket_link);
    setIsPublished(show.is_published !== false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    
    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setShows(shows.filter(show => show.id !== id));
      
      toast({
        title: 'Success',
        description: 'Show deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting show:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete show.',
      });
    }
  };

  const togglePublish = async (show: Show) => {
    try {
      const newPublishState = !show.is_published;
      
      const { error } = await supabase
        .from('shows')
        .update({ is_published: newPublishState })
        .eq('id', show.id);
        
      if (error) throw error;
      
      setShows(shows.map(s => 
        s.id === show.id ? { ...s, is_published: newPublishState } : s
      ));
      
      toast({
        title: 'Success',
        description: `Show ${newPublishState ? 'published' : 'unpublished'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update show visibility.',
      });
    }
  };

  const validateForm = () => {
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a date for the show.',
      });
      return false;
    }
    
    if (!venue) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a venue name.',
      });
      return false;
    }
    
    if (!location) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a location.',
      });
      return false;
    }
    
    if (!ticketLink) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a ticket link.',
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editingShow) {
        // Update existing show
        const { error } = await supabase
          .from('shows')
          .update({
            date,
            venue,
            location,
            ticket_link: ticketLink,
            is_published: isPublished,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingShow.id);
          
        if (error) throw error;
        
        setShows(shows.map(show => 
          show.id === editingShow.id 
            ? { 
                ...show, 
                date, 
                venue, 
                location, 
                ticket_link: ticketLink,
                is_published: isPublished 
              } 
            : show
        ));
        
        toast({
          title: 'Success',
          description: 'Show updated successfully!',
        });
      } else {
        // Create new show
        const newShow = {
          date,
          venue,
          location,
          ticket_link: ticketLink,
          is_published: isPublished
        };
        
        const { data, error } = await supabase
          .from('shows')
          .insert([newShow])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setShows([...shows, data[0]]);
          
          toast({
            title: 'Success',
            description: 'New show added successfully!',
          });
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving show:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingShow ? 'update' : 'add'} show.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Handle various date formats
      const parts = dateString.split(/[/\-\.]/);
      
      // Try to determine the format and parse accordingly
      let formattedDate;
      
      if (parts.length === 3) {
        // Assume day/month/year format if first part is <= 31
        if (parseInt(parts[0]) <= 31) {
          formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
        } else {
          formattedDate = dateString; // Keep as is if unable to parse
        }
      } else {
        formattedDate = dateString; // Keep as is if not in expected format
      }
      
      return formattedDate;
    } catch (e) {
      return dateString; // Fall back to original date string
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Add/Edit Show Form */}
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-black/30 rounded-lg border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">
          {editingShow ? 'Edit Show' : 'Add New Show'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date (dd/mm/yyyy)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-black/50">
                <Calendar size={18} />
              </span>
              <Input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-l-none bg-black/50"
                placeholder="e.g. 25/12/2023"
              />
            </div>
            <p className="text-xs text-white/60">Format: DD/MM/YYYY (e.g. 25/12/2023)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-black/50">
                <MapPin size={18} />
              </span>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="rounded-l-none bg-black/50"
                placeholder="e.g. The Paradise"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-black/50"
              placeholder="e.g. Boston, MA"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ticketLink">Ticket Link</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-black/50">
                <Ticket size={18} />
              </span>
              <Input
                id="ticketLink"
                value={ticketLink}
                onChange={(e) => setTicketLink(e.target.value)}
                className="rounded-l-none bg-black/50"
                placeholder="e.g. https://tickets.com/event"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-white/20 bg-black/50 text-band-purple"
          />
          <Label htmlFor="isPublished">Show on website</Label>
        </div>
        
        <div className="flex justify-between pt-4">
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
            {loading ? 'Saving...' : (editingShow ? 'Update Show' : 'Add Show')}
          </Button>
        </div>
      </form>
      
      {/* Shows List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">All Shows</h3>
        
        {loading && !shows.length ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-white/70">Loading shows...</p>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16 border border-white/10 rounded-lg">
            <p className="text-white/70">No shows added yet.</p>
            <p className="text-white/70 mt-2">Add your first show using the form above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shows.map((show) => (
              <Card key={show.id} className={`bg-black/30 border-white/10 overflow-hidden transition-all ${!show.is_published ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <Calendar size={18} className="mr-2 text-band-purple" />
                        <span className="font-medium">{formatDate(show.date)}</span>
                      </div>
                      <h4 className="text-xl font-bold">{show.venue}</h4>
                      <div className="flex items-center text-white/70">
                        <MapPin size={16} className="mr-2" />
                        <span>{show.location}</span>
                      </div>
                      <a 
                        href={show.ticket_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-band-purple hover:text-band-purple/80"
                      >
                        <Ticket size={16} className="mr-2" />
                        <span>View Tickets</span>
                      </a>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => togglePublish(show)}
                      >
                        {show.is_published ? (
                          <><Eye size={16} className="mr-2" /> Published</>
                        ) : (
                          <><EyeOff size={16} className="mr-2" /> Hidden</>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => handleEdit(show)}
                      >
                        <Edit size={16} className="mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-white/20 text-white hover:bg-red-900/70"
                        onClick={() => handleDelete(show.id)}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsEditor;
