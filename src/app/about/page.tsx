'use client';

import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://stringer.news/api');

  // Load API configuration from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('stringer_api_key');
    const savedBaseUrl = localStorage.getItem('stringer_base_url');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);
  }, []);

  // Save API configuration to localStorage
  const saveConfig = () => {
    localStorage.setItem('stringer_api_key', apiKey);
    localStorage.setItem('stringer_base_url', baseUrl);
    alert('Configuration saved! (Note: API key is not used in MVP)');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">About Stringer Events Explorer</h1>
        <p className="text-muted-foreground text-lg">
          A web dashboard for visualizing and exploring Stringer's events and posts data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How it Works */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">How it Works</h2>
          
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Semantic Tagging</h3>
              <p className="text-muted-foreground">
                Stringer uses advanced semantic analysis to automatically tag events and posts with relevant categories and keywords. This enables powerful filtering and discovery of related content.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Cosine Similarity</h3>
              <p className="text-muted-foreground">
                Events are grouped and related using cosine similarity algorithms that analyze content similarity. This helps identify related events and creates meaningful event hierarchies.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Real-time Processing</h3>
              <p className="text-muted-foreground">
                The system continuously processes incoming posts and events, updating categorizations and relationships in real-time to provide the most current insights.
              </p>
            </div>
          </div>
        </div>

        {/* Events vs Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Events vs Posts</h2>
          
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Events</h3>
              <p className="text-muted-foreground mb-3">
                Events represent significant occurrences or topics that span multiple posts and sources.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contain summaries and highlights</li>
                <li>• Have categories and tags</li>
                <li>• Track post counts and engagement</li>
                <li>• Include location and source information</li>
              </ul>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Posts</h3>
              <p className="text-muted-foreground mb-3">
                Posts are individual pieces of content that may be linked to events.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contain full article content</li>
                <li>• May have media attachments</li>
                <li>• Include source URLs and metadata</li>
                <li>• Can be linked to parent events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">API Configuration</h2>
        <p className="text-muted-foreground mb-6">
          Configure your Stringer API connection. Note: API key authentication is not implemented in the MVP version.
        </p>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium mb-2">
              Base URL
            </label>
            <input
              id="baseUrl"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="https://stringer.news/api"
            />
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              API Key (Optional)
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Your API key (not used in MVP)"
            />
          </div>
          
          <button
            onClick={saveConfig}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Save Configuration
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Connection Status:</strong> Using mock data for development. 
            Real API integration will be available in future versions.
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Technical Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Frontend</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Next.js 14 with App Router</li>
              <li>• React 18 with TypeScript</li>
              <li>• Tailwind CSS for styling</li>
              <li>• shadcn/ui components</li>
              <li>• Recharts for data visualization</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time data fetching</li>
              <li>• Advanced filtering and search</li>
              <li>• Interactive charts and visualizations</li>
              <li>• Responsive design</li>
              <li>• URL-based state management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
