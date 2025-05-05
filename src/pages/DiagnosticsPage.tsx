
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DiagnosticsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  useEffect(() => {
    // Check connection on page load
    testBasicConnection();
  }, []);

  const addResult = (test: string, result: any) => {
    setResults(prev => [{
      test,
      result,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try {
      addResult(`${name} - Starting`, 'Running...');
      const startTime = performance.now();
      const result = await fn();
      const endTime = performance.now();
      addResult(`${name} - Completed in ${(endTime - startTime).toFixed(2)}ms`, result);
      return result;
    } catch (error) {
      addResult(`${name} - Error`, error);
      return null;
    }
  };

  const testBasicConnection = async () => {
    setIsLoading(true);
    try {
      const result = await runTest('Basic Connection Test', async () => {
        console.log('Testing basic Supabase connection in diagnostics...');
        
        // Try a simple query that should always work if the connection is valid
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          console.error('Basic connection test failed with error:', error);
          setConnectionStatus('disconnected');
          return { success: false, error };
        }
        
        console.log('Basic connection test successful, data received:', data);
        setConnectionStatus('connected');
        return { success: true, data };
      });
      
      return result?.success === true;
    } finally {
      setIsLoading(false);
    }
  };

  const testShows = async () => {
    setIsLoading(true);
    try {
      await runTest('Shows Table Test', async () => {
        const { data, error } = await supabase
          .from('shows')
          .select('*')
          .limit(10);
        
        if (error) throw error;
        return data;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testContent = async () => {
    setIsLoading(true);
    try {
      await runTest('Content Table Test', async () => {
        const { data, error } = await supabase
          .from('content')
          .select('*')  
          .limit(5);
        
        if (error) throw error;
        return data;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-band-dark text-white p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white mr-4" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Database Connection Diagnostics</h1>
        </div>
        
        {/* Connection Status */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div 
              className={`w-4 h-4 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'disconnected' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} 
            />
            <h2 className="text-xl font-semibold">
              {connectionStatus === 'connected' ? 'Connected to Database' : 
               connectionStatus === 'disconnected' ? 'Disconnected from Database' : 
               'Checking Connection...'}
            </h2>
          </div>
          
          {connectionStatus === 'disconnected' && (
            <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-4">
              <p className="font-medium mb-2">Connection Issues Detected</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check if the Supabase project is online</li>
                <li>Verify the Supabase URL and API keys are correct</li>
                <li>Check for any network issues or firewall restrictions</li>
                <li>If using a custom domain, verify DNS configuration</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={testBasicConnection}
            disabled={isLoading}
            variant="default"
            className="bg-band-blue hover:bg-band-blue/90"
          >
            Test Basic Connection
          </Button>
          
          <Button 
            onClick={testShows}
            disabled={isLoading || connectionStatus !== 'connected'}
            variant="default"
            className="bg-band-purple hover:bg-band-purple/90"
          >
            Test Shows Table
          </Button>
          
          <Button 
            onClick={testContent} 
            disabled={isLoading || connectionStatus !== 'connected'}
            variant="default"
            className="bg-band-purple hover:bg-band-purple/90"
          >
            Test Content Table
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            Clear Results
          </Button>
        </div>
        
        <div className="bg-black/30 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {results.length === 0 ? (
            <p className="text-white/60">No tests run yet</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 border border-white/10 rounded-lg bg-black/20">
                  <div className="flex justify-between">
                    <p className="font-medium">{result.test}</p>
                    <p className="text-xs text-white/60">{new Date(result.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <pre className="bg-black/30 p-3 mt-2 rounded overflow-auto text-white/80 text-sm">
                    {typeof result.result === 'object' 
                      ? JSON.stringify(result.result, null, 2) 
                      : String(result.result)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  