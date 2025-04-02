import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DiagnosticsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try {
      addResult(`${name} - Starting`, 'Running...');
      const startTime = performance.now();
      const result = await fn();
      const endTime = performance.now();
      addResult(`${name} - Completed in ${(endTime - startTime).toFixed(2)}ms`, result);
    } catch (error) {
      addResult(`${name} - Error`, error);
    }
  };

  const testProfiles = async () => {
    setIsLoading(true);
    try {
      await runTest('Profiles Table Test', async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
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
          .limit(1);
        
        if (error) throw error;
        return data;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testHeroContent = async () => {
    setIsLoading(true);
    try {
      await runTest('Hero Content Test', async () => {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('section', 'hero')
          .single();
        
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-black"> {supabase.DiagnosticsPage} </h1>
      
      <div className="flex space-x-4 mb-6">
        <button 
          disabled={isLoading}
          onClick={testProfiles} 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Test Profiles
        </button>
        
        <button 
          disabled={isLoading}
          onClick={testContent} 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Test Content
        </button>
        
        <button 
          disabled={isLoading}
          onClick={testHeroContent} 
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Test Hero Content
        </button>
        
        <button 
          onClick={clearResults} 
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Results
        </button>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4 text-black">Test Results</h2>
        
        {results.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <p className="font-medium text-black">{result.test}</p>
              <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto text-black">
                {typeof result.result === 'object' 
                  ? JSON.stringify(result.result, null, 2) 
                  : String(result.result)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiagnosticsPage;