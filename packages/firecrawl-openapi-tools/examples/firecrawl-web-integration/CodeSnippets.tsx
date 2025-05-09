import React, { useState, useEffect } from 'react';
import { CustomSnippetGenerator } from 'firecrawl-openapi-tools';

interface CodeSnippetsProps {
  endpoint: string;
  method: string;
  options: {
    url: string;
    formats?: string[];
    onlyMainContent?: boolean;
    includeTags?: string[];
    excludeTags?: string[];
    waitFor?: number;
    limit?: number;
    maxDepth?: number;
    excludePaths?: string[];
    includePaths?: string[];
    ignoreSitemap?: boolean;
    includeSubdomains?: boolean;
    search?: string;
    schema?: Record<string, any>;
    prompt?: string;
  };
}

export const CodeSnippets: React.FC<CodeSnippetsProps> = ({ endpoint, method, options }) => {
  const [snippets, setSnippets] = useState<{
    javascript: string;
    python: string;
    curl: string;
  } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'javascript' | 'python' | 'curl'>('javascript');

  useEffect(() => {
    const specPath = '/path/to/openapi.json';
    
    try {
      const generator = new CustomSnippetGenerator(specPath);
      const generatedSnippets = generator.generateEndpointSnippets(endpoint, method, options);
      
      setSnippets({
        javascript: generatedSnippets.javascript,
        python: generatedSnippets.python,
        curl: generatedSnippets.curl
      });
    } catch (error) {
      console.error('Failed to generate snippets:', error);
    }
  }, [endpoint, method, options]);

  if (!snippets) {
    return <div>Loading snippets...</div>;
  }

  return (
    <div className="code-snippets">
      <div className="tabs">
        <button 
          className={activeTab === 'javascript' ? 'active' : ''} 
          onClick={() => setActiveTab('javascript')}
        >
          JavaScript
        </button>
        <button 
          className={activeTab === 'python' ? 'active' : ''} 
          onClick={() => setActiveTab('python')}
        >
          Python
        </button>
        <button 
          className={activeTab === 'curl' ? 'active' : ''} 
          onClick={() => setActiveTab('curl')}
        >
          cURL
        </button>
      </div>
      
      <div className="code-content">
        <pre>{snippets[activeTab]}</pre>
      </div>
    </div>
  );
};
