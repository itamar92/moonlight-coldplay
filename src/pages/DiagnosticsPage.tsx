import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  testConnection, 
  fetchShows, 
  fetchMedia, 
  fetchTestimonials, 
  fetchContent,
  GOOGLE_SHEET_ID 
} from '@/lib/googleSheets';

const DiagnosticsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    runConnectionTest();
  }, []);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    addResult(`${name} - Starting...`, null);
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      addResult(`${name} - Completed in ${(endTime - startTime).toFixed(2)}ms`, result);
      return result;
    } catch (error) {
      addResult(`${name} - Error`, {
        name: (error as any)?.name,
        message: (error as any)?.message,
      });
      return null;
    }
  };

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const result = await runTest('Google Sheets Connection Test', async () => {
        const connectionResult = await testConnection();
        setConnectionStatus(connectionResult.success ? 'connected' : 'disconnected');
        return connectionResult;
      });
      return result?.success === true;
    } finally {
      setIsLoading(false);
    }
  };

  const testShows = async () => {
    setIsLoading(true);
    try {
      await runTest('Fetch Shows (Coldplay tab)', async () => {
        const shows = await fetchShows();
        return { count: shows.length, sample: shows.slice(0, 3) };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMedia = async () => {
    setIsLoading(true);
    try {
      await runTest('Fetch Media', async () => {
        const media = await fetchMedia();
        return { count: media.length, sample: media.slice(0, 3) };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTestimonials = async () => {
    setIsLoading(true);
    try {
      await runTest('Fetch Testimonials', async () => {
        const testimonials = await fetchTestimonials();
        return { count: testimonials.length, sample: testimonials.slice(0, 3) };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testContent = async () => {
    setIsLoading(true);
    try {
      await runTest('Fetch Content', async () => {
        const content = await fetchContent();
        return { sections: Object.keys(content), content };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="min-h-screen bg-band-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/"><Button variant="ghost" className="text-white mr-4" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-3xl font-bold">Google Sheets Diagnostics</h1>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-black/50 border border-white/10">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
            <span className="capitalize">{connectionStatus}</span>
          </div>
          <p className="text-sm text-white/60 mt-2">Sheet ID: <code className="bg-black/30 px-2 py-1 rounded">{GOOGLE_SHEET_ID}</code></p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          <Button onClick={runConnectionTest} disabled={isLoading} className="bg-band-purple hover:bg-band-purple/80">Test Connection</Button>
          <Button onClick={testShows} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10">Test Shows</Button>
          <Button onClick={testMedia} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10">Test Media</Button>
          <Button onClick={testTestimonials} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10">Test Testimonials</Button>
          <Button onClick={testContent} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10">Test Content</Button>
          <Button onClick={clearResults} variant="ghost" className="text-white/60 hover:text-white">Clear</Button>
        </div>

        <div className="bg-black/50 rounded-lg p-4 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {results.length === 0 ? (
            <p className="text-white/60">No tests run yet.</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {results.map((item, index) => (
                <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-band-purple">{item.test}</span>
                    <span className="text-xs text-white/40">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {item.result && <pre className="text-sm text-white/80 bg-black/30 p-3 rounded overflow-x-auto">{JSON.stringify(item.result, null, 2)}</pre>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
