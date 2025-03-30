
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Edit, MapPin, MoreHorizontal, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ShowData {
  id?: string;
  date: string;
  venue: string;
  location: string;
  ticket_link: string;
  is_published?: boolean;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [shows, setShows] = useState<ShowData[]>([]);
  const [editingShow, setEditingShow] = useState<ShowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ShowData>({
    defaultValues: {
      date: '',
      venue: '',
      location: '',
      ticket_link: '',
      is_published: true
    }
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(profileData?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchShows();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (editingShow) {
      form.reset({
        date: editingShow.date,
        venue: editingShow.venue,
        location: editingShow.location,
        ticket_link: editingShow.ticket_link,
        is_published: editingShow.is_published
      });
    } else {
      form.reset({
        date: '',
        venue: '',
        location: '',
        ticket_link: '',
        is_published: true
      });
    }
  }, [editingShow]);

  const fetchShows = async () => {
    try {
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
        title: 'Error fetching shows',
        description: "Couldn't load shows. Please try again.",
      });
    }
  };

  const syncWithGoogleSheet = async () => {
    try {
      setIsSubmitting(true);
      toast({
        title: 'Syncing with Google Sheet',
        description: "Fetching latest show data...",
      });
      
      const { data, error } = await supabase.functions.invoke('fetch-google-sheet');
      
      if (error) throw error;
      
      if (!data.shows || !Array.isArray(data.shows)) {
        throw new Error("Invalid data format from Google Sheet");
      }
      
      // Insert each show into the database
      for (const show of data.shows) {
        const { error: insertError } = await supabase
          .from('shows')
          .insert(show);
          
        if (insertError) throw insertError;
      }
      
      await fetchShows();
      
      toast({
        title: 'Sync Complete',
        description: `Successfully imported ${data.shows.length} shows from Google Sheet.`,
      });
    } catch (error: any) {
      console.error('Error syncing with Google Sheet:', error);
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error.message || "Couldn't sync shows from Google Sheet.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: ShowData) => {
    try {
      setIsSubmitting(true);
      
      if (editingShow?.id) {
        // Update existing show
        const { error } = await supabase
          .from('shows')
          .update({
            date: data.date,
            venue: data.venue,
            location: data.location,
            ticket_link: data.ticket_link,
            is_published: data.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingShow.id);
          
        if (error) throw error;
        
        toast({
          title: 'Show Updated',
          description: "The show has been updated successfully.",
        });
      } else {
        // Create new show
        const { error } = await supabase
          .from('shows')
          .insert({
            date: data.date,
            venue: data.venue,
            location: data.location,
            ticket_link: data.ticket_link,
            is_published: data.is_published
          });
          
        if (error) throw error;
        
        toast({
          title: 'Show Created',
          description: "The show has been created successfully.",
        });
      }
      
      setEditingShow(null);
      form.reset();
      fetchShows();
    } catch (error: any) {
      console.error('Error saving show:', error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Show',
        description: error.message || "Couldn't save the show. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    
    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Show Deleted',
        description: "The show has been deleted successfully.",
      });
      
      fetchShows();
    } catch (error: any) {
      console.error('Error deleting show:', error);
      toast({
        variant: 'destructive',
        title: 'Error Deleting Show',
        description: error.message || "Couldn't delete the show. Please try again.",
      });
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({
          is_published: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: currentStatus ? 'Show Unpublished' : 'Show Published',
        description: `The show is now ${currentStatus ? 'hidden from' : 'visible on'} the public page.`,
      });
      
      fetchShows();
    } catch (error: any) {
      console.error('Error updating show status:', error);
      toast({
        variant: 'destructive',
        title: 'Error Updating Status',
        description: error.message || "Couldn't update show status. Please try again.",
      });
    }
  };

  // Redirect if not admin and loading completed
  if (isLoading) {
    return (
      <div className="min-h-screen bg-band-dark flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-band-purple border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-3 text-white">Checking admin status...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-band-dark">
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">Admin Dashboard</h1>
        
        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="shows">Shows Management</TabsTrigger>
            {/* Add more tabs in the future like "Users", "Content", etc. */}
          </TabsList>
          
          <TabsContent value="shows">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Show Form */}
              <Card className="lg:col-span-1 bg-black/50 border-band-purple/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingShow ? 'Edit Show' : 'Add New Show'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Date</FormLabel>
                            <FormControl>
                              <Input placeholder="Mar 15, 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Venue</FormLabel>
                            <FormControl>
                              <Input placeholder="The Grand Hall" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Location</FormLabel>
                            <FormControl>
                              <Input placeholder="New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ticket_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Ticket Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://tickets.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="is_published"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-white">Published</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="w-full bg-band-purple hover:bg-band-purple/80"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : (editingShow ? 'Update Show' : 'Add Show')}
                        </Button>
                        
                        {editingShow && (
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setEditingShow(null)}
                            className="border-band-purple text-band-purple hover:bg-band-purple/10"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={syncWithGoogleSheet} 
                      className="w-full bg-band-blue hover:bg-band-blue/80"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Syncing...' : 'Sync with Google Sheet'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Shows List */}
              <Card className="lg:col-span-2 bg-black/50 border-band-purple/20">
                <CardHeader>
                  <CardTitle className="text-white">Manage Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  {shows.length === 0 ? (
                    <div className="text-center py-10 text-white/70">
                      <p>No shows found. Add a new show or sync with Google Sheet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shows.map((show) => (
                        <div 
                          key={show.id} 
                          className={`p-4 border rounded-lg ${
                            show.is_published 
                              ? 'border-green-400/30 bg-green-950/20' 
                              : 'border-red-400/30 bg-red-950/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{show.venue}</h3>
                              
                              <div className="flex items-center mb-2 text-band-purple">
                                <Calendar size={16} className="mr-1" />
                                <span className="text-sm">{show.date}</span>
                              </div>
                              
                              <div className="flex items-center mb-3 text-white/70">
                                <MapPin size={14} className="mr-1" />
                                <span className="text-sm">{show.location}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <a 
                                  href={show.ticket_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs flex items-center text-white/60 hover:text-white"
                                >
                                  <ExternalLink size={12} className="mr-1" />
                                  Ticket Link
                                </a>
                                
                                <div className="mx-3 text-white/30">•</div>
                                
                                <div className={`text-xs flex items-center ${
                                  show.is_published ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {show.is_published ? (
                                    <>
                                      <CheckCircle size={12} className="mr-1" />
                                      Published
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={12} className="mr-1" />
                                      Hidden
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 bg-black/90">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setEditingShow(show)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => togglePublishStatus(show.id!, !!show.is_published)}
                                  className="cursor-pointer"
                                >
                                  {show.is_published ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Publish
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(show.id!)}
                                  className="cursor-pointer text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
