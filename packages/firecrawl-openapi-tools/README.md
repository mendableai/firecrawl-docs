# Firecrawl OpenAPI Tools

A shared package for generating code snippets and documentation from Firecrawl's OpenAPI specification. This package provides a single source of truth for documentation across Firecrawl repositories.

## Installation

```bash
npm install firecrawl-openapi-tools
```

## Usage

### Generating Code Snippets

```typescript
import { CustomSnippetGenerator } from 'firecrawl-openapi-tools';

// Create a generator with the path to your OpenAPI spec
const generator = new CustomSnippetGenerator('/path/to/openapi.json');

// Generate snippets for a specific endpoint
const snippets = generator.generateEndpointSnippets('/scrape', 'POST', {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html'],
  onlyMainContent: true
});

console.log(snippets.javascript); // JavaScript code snippet
console.log(snippets.python);     // Python code snippet
console.log(snippets.curl);       // cURL code snippet
console.log(snippets.response);   // Example response JSON
```

### Generating Mintlify Documentation Snippets

```typescript
import { CustomSnippetGenerator } from 'firecrawl-openapi-tools';

// Create a generator with the path to your OpenAPI spec
const generator = new CustomSnippetGenerator('/path/to/openapi.json');

// Generate all snippets for Mintlify docs
generator.generateMintlifySnippets('/path/to/output/directory', {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html']
});
```

### CLI Usage

```bash
# Generate snippets for Mintlify docs
npx firecrawl-openapi generate-snippets --spec=/path/to/openapi.json --output=/path/to/output --url=https://firecrawl.dev --formats=markdown,html

# Generate documentation (coming soon)
npx firecrawl-openapi generate-docs --spec=/path/to/openapi.json --output=/path/to/output
```

## Integration with firecrawl-web

To use this package in firecrawl-web for the "Get Code" button:

```typescript
import { CustomSnippetGenerator } from 'firecrawl-openapi-tools';
import { useState, useEffect } from 'react';

interface CodeSnippetsProps {
  endpoint: string;
  method: string;
  options: {
    url: string;
    formats?: string[];
    onlyMainContent?: boolean;
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
    // Path to the OpenAPI spec (could be fetched from a CDN or included in the build)
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
```

## Integration with firecrawl-docs

This package can be used to automatically generate all code snippets for the Mintlify documentation. Add this to your build process:

```javascript
// scripts/generate-snippets.js
const path = require('path');
const { CustomSnippetGenerator } = require('firecrawl-openapi-tools');

// Path to the OpenAPI spec in the docs repo
const specPath = path.resolve(__dirname, '../api-reference/v1-openapi.json');

// Output directory for generated snippets
const outputDir = path.resolve(__dirname, '../snippets/v1');

// Create a generator
const generator = new CustomSnippetGenerator(specPath);

// Generate snippets with default options
generator.generateMintlifySnippets(outputDir, {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html']
});

console.log(`Generated snippets in ${outputDir}`);
```

Then add this script to your package.json:

```json
{
  "scripts": {
    "generate-snippets": "node scripts/generate-snippets.js"
  }
}
```

## CI/CD Integration

To keep documentation in sync across repositories, add the snippet generation to your CI/CD pipeline:

### GitHub Actions Example

```yaml
name: Generate API Snippets

on:
  push:
    paths:
      - 'api-reference/v1-openapi.json'
    branches:
      - main

jobs:
  generate-snippets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install firecrawl-openapi-tools
        
      - name: Generate snippets
        run: npx firecrawl-openapi generate-snippets --spec=./api-reference/v1-openapi.json --output=./snippets/v1
        
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update API snippets from OpenAPI spec"
          file_pattern: snippets/v1/**/*
```

## Supported Options

The snippet generator supports the following options:

```typescript
interface SnippetOptions {
  apiKey?: string;            // API key to use in snippets (defaults to placeholder)
  url?: string;               // URL to use in examples
  formats?: string[];         // Output formats (markdown, html, text)
  onlyMainContent?: boolean;  // Whether to extract only main content
  includeTags?: string[];     // HTML tags to include
  excludeTags?: string[];     // HTML tags to exclude
  waitFor?: number;           // Milliseconds to wait for JS execution
  limit?: number;             // Max number of pages to crawl
  maxDepth?: number;          // Max depth for crawling
  excludePaths?: string[];    // Paths to exclude when crawling
  includePaths?: string[];    // Paths to include when crawling
  ignoreSitemap?: boolean;    // Whether to ignore sitemap
  includeSubdomains?: boolean; // Whether to include subdomains
  search?: string;            // Search term for map endpoint
  schema?: Record<string, any>; // Schema for extract endpoint
  prompt?: string;            // Prompt for extract endpoint
}
```

## Benefits

- **Single Source of Truth**: All code snippets and documentation are generated from the OpenAPI spec
- **Consistency**: Ensures that all code examples are consistent across repositories
- **Maintainability**: When the API changes, update only the OpenAPI spec and regenerate snippets
- **Automation**: Can be integrated into CI/CD pipelines to keep documentation in sync
- **Type Safety**: TypeScript definitions for all options and return types
- **Customization**: Supports all Firecrawl API options and parameters
