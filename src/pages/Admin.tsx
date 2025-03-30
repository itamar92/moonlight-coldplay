
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, MapPinIcon, LinkIcon, PlusCircleIcon, RefreshCwIcon, PencilIcon, TrashIcon, LockIcon, UnlockIcon } from 'lucide-react';

interface Show {
  id: string;
  date: string;
  venue: string;
  location: string;
  ticket_link: string;
  is_published: boolean;
}

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentShow, setCurrentShow] = useState<Show | null>(null);
  const { toast } = useToast();

  // Check authentication and admin status
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.session.user.id)
          .single();
          
        setIsAdmin(profileData?.is_admin || false);
      }
      
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(profileData?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch shows
  useEffect(() => {
    const fetchShows = async () => {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching shows:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching shows',
          description: error.message,
        });
        return;
      }

      setShows(data || []);
    };

    if (session) {
      fetchShows();
    }
  }, [session]);

  const importFromGoogleSheet = async () => {
    try {
      setLoading(true);
      
      // Call edge function to fetch Google Sheet data
      const { data: sheetData, error: functionError } = await supabase.functions.invoke('fetch-google-sheet');
      
      if (functionError) throw new Error(functionError.message);
      
      if (!sheetData.shows || !sheetData.shows.length) {
        toast({
          variant: 'destructive',
          title: 'Import failed',
          description: 'No shows found in Google Sheet',
        });
        return;
      }
      
      // Insert shows into database
      const { error } = await supabase
        .from('shows')
        .insert(sheetData.shows);
        
      if (error) throw error;
      
      toast({
        title: 'Import successful',
        description: `${sheetData.shows.length} shows imported from Google Sheet`,
      });
      
      // Refresh shows list
      const { data: refreshedShows } = await supabase
        .from('shows')
        .select('*')
        .order('date', { ascending: true });
        
      setShows(refreshedShows || []);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.message,
      });
    } finally {
      setImportDialogOpen(false);
      setLoading(false);
    }
  };
  
  const handleEdit = (show: Show) => {
    setCurrentShow({ ...show });
    setEditDialogOpen(true);
  };
  
  const handleCreate = () => {
    setCurrentShow({
      id: '',
      date: '',
      venue: '',
      location: '',
      ticket_link: '#',
      is_published: true
    });
    setEditDialogOpen(true);
  };
  
  const saveShow = async () => {
    if (!currentShow) return;
    
    try {
      setLoading(true);
      
      if (currentShow.id) {
        // Update existing show
        const { error } = await supabase
          .from('shows')
          .update({
            date: currentShow.date,
            venue: currentShow.venue,
            location: currentShow.location,
            ticket_link: currentShow.ticket_link,
            is_published: currentShow.is_published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentShow.id);
          
        if (error) throw error;
        
        toast({
          title: 'Show updated',
          description: `Updated show at ${currentShow.venue}`,
        });
      } else {
        // Create new show
        const { error } = await supabase
          .from('shows')
          .insert({
            date: currentShow.date,
            venue: currentShow.venue,
            location: currentShow.location,
            ticket_link: currentShow.ticket_link,
            is_published: currentShow.is_published,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Show created',
          description: `New show at ${currentShow.venue} created`,
        });
      }
      
      // Refresh shows list
      const { data: refreshedShows } = await supabase
        .from('shows')
        .select('*')
        .order('date', { ascending: true });
        
      setShows(refreshedShows || []);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message,
      });
    } finally {
      setEditDialogOpen(false);
      setLoading(false);
    }
  };
  
  const deleteShow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Show deleted',
        description: 'The show has been removed',
      });
      
      // Remove from local state
      setShows(shows.filter(show => show.id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shows')
        .update({ is_published: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setShows(shows.map(show => 
        show.id === id ? { ...show, is_published: !currentStatus } : show
      ));
      
      toast({
        title: currentStatus ? 'Show unpublished' : 'Show published',
        description: `The show is now ${currentStatus ? 'hidden from' : 'visible to'} the public`,
      });
    } catch (error: any) {
      console.error('Toggle published error:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Redirect if not authenticated or not admin
  if (!loading && (!session || !isAdmin)) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-band-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-band-dark">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Shows Admin</h1>
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="border-band-purple text-band-purple hover:bg-band-purple/20"
              onClick={() => setImportDialogOpen(true)}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Import from Google Sheet
            </Button>
            <Button 
              variant="outline" 
              className="border-band-blue text-band-blue hover:bg-band-blue/20"
              onClick={handleCreate}
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add Show
            </Button>
            <Button 
              variant="destructive"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </header>

        <div className="bg-black/50 border border-band-purple/20 rounded-lg backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Venue</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/60 py-8">
                    No shows found. Import from Google Sheet or add shows manually.
                  </TableCell>
                </TableRow>
              ) : (
                shows.map((show) => (
                  <TableRow key={show.id} className="border-b border-band-purple/20">
                    <TableCell className="font-medium text-white">{show.date}</TableCell>
                    <TableCell className="text-white">{show.venue}</TableCell>
                    <TableCell className="text-white">{show.location}</TableCell>
                    <TableCell className="text-white">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${show.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {show.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(show.id, show.is_published)}
                          title={show.is_published ? "Hide show" : "Publish show"}
                        >
                          {show.is_published ? <LockIcon className="h-4 w-4 text-white/70" /> : <UnlockIcon className="h-4 w-4 text-white/70" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(show)}
                          title="Edit show"
                        >
                          <PencilIcon className="h-4 w-4 text-white/70" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteShow(show.id)}
                          title="Delete show"
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-band-dark border-band-purple/20 text-white">
          <DialogHeader>
            <DialogTitle>Import Shows from Google Sheet</DialogTitle>
            <DialogDescription className="text-white/70">
              This will import all shows from the configured Google Sheet and add them to your database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={importFromGoogleSheet}
              className="bg-band-blue text-white"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import Shows'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-band-dark border-band-purple/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{currentShow?.id ? 'Edit Show' : 'Create New Show'}</DialogTitle>
            <DialogDescription className="text-white/70">
              {currentShow?.id ? 'Update the details for this show.' : 'Add a new show to your schedule.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Date
              </label>
              <Input
                value={currentShow?.date || ''}
                onChange={(e) => setCurrentShow(prev => prev ? {...prev, date: e.target.value} : null)}
                placeholder="June 15, 2024"
                className="bg-black/30 border-band-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4" />
                Venue
              </label>
              <Input
                value={currentShow?.venue || ''}
                onChange={(e) => setCurrentShow(prev => prev ? {...prev, venue: e.target.value} : null)}
                placeholder="Venue name"
                className="bg-black/30 border-band-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4" />
                Location
              </label>
              <Input
                value={currentShow?.location || ''}
                onChange={(e) => setCurrentShow(prev => prev ? {...prev, location: e.target.value} : null)}
                placeholder="City, State"
                className="bg-black/30 border-band-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" />
                Ticket Link
              </label>
              <Input
                value={currentShow?.ticket_link || ''}
                onChange={(e) => setCurrentShow(prev => prev ? {...prev, ticket_link: e.target.value} : null)}
                placeholder="https://..."
                className="bg-black/30 border-band-purple/30"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_published"
                checked={currentShow?.is_published || false}
                onChange={(e) => setCurrentShow(prev => prev ? {...prev, is_published: e.target.checked} : null)}
                className="rounded border-band-purple/30"
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Publish this show (visible on website)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={saveShow}
              className="bg-band-purple text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Show'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
