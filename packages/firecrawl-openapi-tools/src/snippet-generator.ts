import * as fs from 'fs';
import * as path from 'path';
import { SnippetOptions, GeneratedSnippet, EndpointSnippets } from './types';

const OpenAPISnippet = require('openapi-snippet');

export class FirecrawlSnippetGenerator {
  private openApiSpec: any;
  private targets = ['shell_curl', 'node_fetch', 'python_requests'];

  constructor(openApiSpecPath: string) {
    try {
      console.log(`Loading OpenAPI spec from: ${openApiSpecPath}`);
      const specContent = fs.readFileSync(openApiSpecPath, 'utf8');
      this.openApiSpec = JSON.parse(specContent);
      
      if (!this.openApiSpec || !this.openApiSpec.paths) {
        throw new Error('Invalid OpenAPI spec: missing paths property');
      }
      
      if (!this.openApiSpec.servers || this.openApiSpec.servers.length === 0) {
        this.openApiSpec.servers = [
          {
            url: 'https://api.firecrawl.dev/v1'
          }
        ];
      }
      
      console.log('OpenAPI spec loaded successfully');
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }
  }

  /**
   * Generate code snippets for a specific endpoint
   */
  public generateEndpointSnippets(
    endpoint: string,
    method: string,
    options: SnippetOptions = {}
  ): EndpointSnippets {
    const requestObject = this.createRequestObject(endpoint, method, options);
    
    try {
      const snippets = OpenAPISnippet.getEndpointSnippets(
        this.openApiSpec,
        requestObject.url,
        requestObject.method,
        this.targets,
        requestObject.body
      );

      return {
        curl: this.formatCurlSnippet(snippets.snippets[0].content, options),
        javascript: this.formatJavaScriptSnippet(snippets.snippets[1].content, endpoint, options),
        python: this.formatPythonSnippet(snippets.snippets[2].content, endpoint, options),
        response: this.generateResponseExample(endpoint, method)
      };
    } catch (error) {
      throw new Error(`Failed to generate snippets: ${error}`);
    }
  }

  /**
   * Generate snippets for all endpoints in the OpenAPI spec
   */
  public generateAllSnippets(options: SnippetOptions = {}): Record<string, EndpointSnippets> {
    const result: Record<string, EndpointSnippets> = {};
    
    for (const path in this.openApiSpec.paths) {
      const pathObj = this.openApiSpec.paths[path];
      
      for (const method in pathObj) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const operationId = pathObj[method].operationId;
          if (operationId) {
            result[operationId] = this.generateEndpointSnippets(path, method, options);
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Create a request object for the OpenAPI snippet generator
   */
  private createRequestObject(
    endpoint: string,
    method: string,
    options: SnippetOptions
  ): { url: string; method: string; body?: any } {
    let url = endpoint;
    const pathParams = url.match(/\{([^}]+)\}/g);
    
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        url = url.replace(param, `example-${paramName}`);
      });
    }

    const body: any = {};
    
    if (options.url) {
      body.url = options.url;
    } else if (method.toLowerCase() === 'post' && (endpoint.includes('/scrape') || endpoint.includes('/crawl'))) {
      body.url = 'https://firecrawl.dev';
    }

    if (options.formats && options.formats.length > 0) {
      if (endpoint.includes('/crawl')) {
        body.scrapeOptions = body.scrapeOptions || {};
        body.scrapeOptions.formats = options.formats;
      } else {
        body.formats = options.formats;
      }
    }

    if (options.onlyMainContent !== undefined) {
      if (endpoint.includes('/crawl')) {
        body.scrapeOptions = body.scrapeOptions || {};
        body.scrapeOptions.onlyMainContent = options.onlyMainContent;
      } else {
        body.onlyMainContent = options.onlyMainContent;
      }
    }

    if (options.limit) {
      body.limit = options.limit;
    }

    if (options.maxDepth) {
      body.maxDepth = options.maxDepth;
    }

    if (options.excludePaths && options.excludePaths.length > 0) {
      body.excludePaths = options.excludePaths;
    }

    if (options.includePaths && options.includePaths.length > 0) {
      body.includePaths = options.includePaths;
    }

    if (options.ignoreSitemap !== undefined) {
      body.ignoreSitemap = options.ignoreSitemap;
    }

    if (options.includeSubdomains !== undefined) {
      body.includeSubdomains = options.includeSubdomains;
    }

    if (options.search) {
      body.search = options.search;
    }

    if (options.schema) {
      body.schema = options.schema;
    }

    if (options.prompt) {
      body.prompt = options.prompt;
    }

    return {
      url,
      method: method.toUpperCase(),
      body: Object.keys(body).length > 0 ? body : undefined
    };
  }

  /**
   * Format the cURL snippet to match Firecrawl's style
   */
  private formatCurlSnippet(snippet: string, options: SnippetOptions): string {
    const apiKey = options.apiKey || 'fc-YOUR_API_KEY';
    return snippet
      .replace(/Authorization: Bearer [^\n]+/g, `Authorization: Bearer ${apiKey}`)
      .replace(/https:\/\/api\.example\.com/g, 'https://api.firecrawl.dev/v1');
  }

  /**
   * Format the JavaScript snippet to use the Firecrawl SDK
   */
  private formatJavaScriptSnippet(snippet: string, endpoint: string, options: SnippetOptions): string {
    const apiKey = options.apiKey || 'fc-YOUR_API_KEY';
    
    let sdkSnippet = '// Install with npm install @mendable/firecrawl-js\n';
    sdkSnippet += "import FirecrawlApp from '@mendable/firecrawl-js';\n\n";
    sdkSnippet += `const app = new FirecrawlApp({apiKey: "${apiKey}"});\n\n`;
    
    if (endpoint.includes('/scrape')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `const scrapeResult = await app.scrapeUrl('${url}'`;
      
      if (options.formats || options.onlyMainContent !== undefined || options.includeTags || options.excludeTags || options.waitFor) {
        sdkSnippet += ', {\n';
        
        if (options.formats && options.formats.length > 0) {
          sdkSnippet += `  formats: ['${options.formats.join("', '")}'],\n`;
        }
        
        if (options.onlyMainContent === false) {
          sdkSnippet += '  onlyMainContent: false,\n';
        }
        
        if (options.includeTags && options.includeTags.length > 0) {
          sdkSnippet += `  includeTags: ['${options.includeTags.join("', '")}'],\n`;
        }
        
        if (options.excludeTags && options.excludeTags.length > 0) {
          sdkSnippet += `  excludeTags: ['${options.excludeTags.join("', '")}'],\n`;
        }
        
        if (options.waitFor) {
          sdkSnippet += `  waitFor: ${options.waitFor},\n`;
        }
        
        sdkSnippet += '}';
      }
      
      sdkSnippet += ');\n';
      sdkSnippet += '\nif (!scrapeResult.success) {\n';
      sdkSnippet += '  throw new Error(`Failed to scrape: ${scrapeResult.error}`);\n';
      sdkSnippet += '}\n\n';
      sdkSnippet += 'console.log(scrapeResult);';
    } else if (endpoint.includes('/crawl')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `const crawlResponse = await app.crawlUrl('${url}'`;
      
      const hasOptions = options.limit || options.maxDepth || options.excludePaths || options.includePaths || 
                         options.ignoreSitemap !== undefined || options.formats || options.onlyMainContent !== undefined;
      
      if (hasOptions) {
        sdkSnippet += ', {\n';
        
        if (options.limit) {
          sdkSnippet += `  limit: ${options.limit},\n`;
        }
        
        if (options.maxDepth) {
          sdkSnippet += `  maxDepth: ${options.maxDepth},\n`;
        }
        
        if (options.excludePaths && options.excludePaths.length > 0) {
          sdkSnippet += `  excludePaths: ['${options.excludePaths.join("', '")}'],\n`;
        }
        
        if (options.includePaths && options.includePaths.length > 0) {
          sdkSnippet += `  includePaths: ['${options.includePaths.join("', '")}'],\n`;
        }
        
        if (options.ignoreSitemap !== undefined) {
          sdkSnippet += `  ignoreSitemap: ${options.ignoreSitemap},\n`;
        }
        
        if (options.formats || options.onlyMainContent !== undefined) {
          sdkSnippet += '  scrapeOptions: {\n';
          
          if (options.formats && options.formats.length > 0) {
            sdkSnippet += `    formats: ['${options.formats.join("', '")}'],\n`;
          }
          
          if (options.onlyMainContent === false) {
            sdkSnippet += '    onlyMainContent: false,\n';
          }
          
          sdkSnippet += '  }\n';
        } else {
          sdkSnippet = sdkSnippet.replace(/,\n$/, '\n');
        }
        
        sdkSnippet += '})';
      } else {
        sdkSnippet += ')';
      }
      
      sdkSnippet += '\n\nif (!crawlResponse.success) {\n';
      sdkSnippet += '  throw new Error(`Failed to crawl: ${crawlResponse.error}`)\n';
      sdkSnippet += '}\n\n';
      sdkSnippet += 'console.log(crawlResponse)';
    } else if (endpoint.includes('/map')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `const mapResponse = await app.mapUrl('${url}'`;
      
      if (options.includeSubdomains !== undefined || options.search || options.ignoreSitemap !== undefined) {
        sdkSnippet += ', {\n';
        
        if (options.includeSubdomains !== undefined) {
          sdkSnippet += `  includeSubdomains: ${options.includeSubdomains},\n`;
        }
        
        if (options.search) {
          sdkSnippet += `  search: '${options.search}',\n`;
        }
        
        if (options.ignoreSitemap !== undefined) {
          sdkSnippet += `  ignoreSitemap: ${options.ignoreSitemap},\n`;
        }
        
        sdkSnippet = sdkSnippet.replace(/,\n$/, '\n');
        
        sdkSnippet += '})';
      } else {
        sdkSnippet += ')';
      }
      
      sdkSnippet += '\n\nif (!mapResponse.success) {\n';
      sdkSnippet += '  throw new Error(`Failed to map: ${mapResponse.error}`)\n';
      sdkSnippet += '}\n\n';
      sdkSnippet += 'console.log(mapResponse)';
    } else if (endpoint.includes('/extract')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `const extractResponse = await app.extract(['${url}']`;
      
      if (options.schema || options.prompt) {
        sdkSnippet += ', {\n';
        
        if (options.schema) {
          sdkSnippet += `  schema: ${JSON.stringify(options.schema, null, 2)},\n`;
        }
        
        if (options.prompt) {
          sdkSnippet += `  prompt: '${options.prompt}',\n`;
        }
        
        sdkSnippet = sdkSnippet.replace(/,\n$/, '\n');
        
        sdkSnippet += '})';
      } else {
        sdkSnippet += ')';
      }
      
      sdkSnippet += '\n\nif (!extractResponse.success) {\n';
      sdkSnippet += '  throw new Error(`Failed to extract: ${extractResponse.error}`)\n';
      sdkSnippet += '}\n\n';
      sdkSnippet += 'console.log(extractResponse)';
    } else {
      return snippet
        .replace(/fetch\('https:\/\/api\.example\.com/g, "fetch('https://api.firecrawl.dev/v1")
        .replace(/Authorization: Bearer [^']+/g, `Authorization: Bearer ${apiKey}`);
    }
    
    return sdkSnippet;
  }

  /**
   * Format the Python snippet to use the Firecrawl SDK
   */
  private formatPythonSnippet(snippet: string, endpoint: string, options: SnippetOptions): string {
    const apiKey = options.apiKey || 'fc-YOUR_API_KEY';
    
    let sdkSnippet = '# Install with pip install firecrawl-py\n';
    sdkSnippet += 'from firecrawl import FirecrawlApp';
    
    if (endpoint.includes('/crawl') || endpoint.includes('/scrape')) {
      sdkSnippet += ', ScrapeOptions';
    }
    
    sdkSnippet += '\n\n';
    sdkSnippet += `app = FirecrawlApp(api_key='${apiKey}')\n\n`;
    
    if (endpoint.includes('/scrape')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `# Scrape a single URL:\n`;
      sdkSnippet += `response = app.scrape_url(url='${url}'`;
      
      if (options.formats || options.onlyMainContent !== undefined || options.includeTags || options.excludeTags || options.waitFor) {
        sdkSnippet += ', params={\n';
        
        if (options.formats && options.formats.length > 0) {
          sdkSnippet += `  'formats': ['${options.formats.join("', '")}'],\n`;
        }
        
        if (options.onlyMainContent === false) {
          sdkSnippet += "  'onlyMainContent': False,\n";
        }
        
        if (options.includeTags && options.includeTags.length > 0) {
          sdkSnippet += `  'includeTags': ['${options.includeTags.join("', '")}'],\n`;
        }
        
        if (options.excludeTags && options.excludeTags.length > 0) {
          sdkSnippet += `  'excludeTags': ['${options.excludeTags.join("', '")}'],\n`;
        }
        
        if (options.waitFor) {
          sdkSnippet += `  'waitFor': ${options.waitFor},\n`;
        }
        
        sdkSnippet += '}';
      }
      
      sdkSnippet += ')\n';
      sdkSnippet += 'print(response)';
    } else if (endpoint.includes('/crawl')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `# Crawl a website:\n`;
      sdkSnippet += `crawl_result = app.crawl_url(\n`;
      sdkSnippet += `  '${url}'`;
      
      if (options.limit) {
        sdkSnippet += `, \n  limit=${options.limit}`;
      }
      
      if (options.maxDepth) {
        sdkSnippet += `, \n  max_depth=${options.maxDepth}`;
      }
      
      if (options.excludePaths && options.excludePaths.length > 0) {
        sdkSnippet += `, \n  exclude_paths=['${options.excludePaths.join("', '")}']`;
      }
      
      if (options.includePaths && options.includePaths.length > 0) {
        sdkSnippet += `, \n  include_paths=['${options.includePaths.join("', '")}']`;
      }
      
      if (options.ignoreSitemap !== undefined) {
        sdkSnippet += `, \n  ignore_sitemap=${options.ignoreSitemap ? 'True' : 'False'}`;
      }
      
      if (options.formats || options.onlyMainContent !== undefined) {
        sdkSnippet += `, \n  scrape_options=ScrapeOptions(`;
        
        const scrapeOptions: string[] = [];
        
        if (options.formats && options.formats.length > 0) {
          scrapeOptions.push(`formats=['${options.formats.join("', '")}']`);
        }
        
        if (options.onlyMainContent === false) {
          scrapeOptions.push('only_main_content=False');
        }
        
        sdkSnippet += scrapeOptions.join(', ');
        sdkSnippet += ')';
      }
      
      sdkSnippet += ',\n)\n';
      sdkSnippet += 'print(crawl_result)';
    } else if (endpoint.includes('/map')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `# Map a website:\n`;
      sdkSnippet += `map_result = app.map_url(\n`;
      sdkSnippet += `  '${url}'`;
      
      if (options.includeSubdomains !== undefined) {
        sdkSnippet += `, \n  include_subdomains=${options.includeSubdomains ? 'True' : 'False'}`;
      }
      
      if (options.search) {
        sdkSnippet += `, \n  search='${options.search}'`;
      }
      
      if (options.ignoreSitemap !== undefined) {
        sdkSnippet += `, \n  ignore_sitemap=${options.ignoreSitemap ? 'True' : 'False'}`;
      }
      
      sdkSnippet += '\n)\n';
      sdkSnippet += 'print(map_result)';
    } else if (endpoint.includes('/extract')) {
      const url = options.url || 'https://firecrawl.dev';
      sdkSnippet += `# Extract structured data:\n`;
      sdkSnippet += `extract_result = app.extract(\n`;
      sdkSnippet += `  urls=['${url}']`;
      
      if (options.schema) {
        sdkSnippet += `, \n  schema=${JSON.stringify(options.schema, null, 2).replace(/"/g, "'")}`;
      }
      
      if (options.prompt) {
        sdkSnippet += `, \n  prompt='${options.prompt}'`;
      }
      
      sdkSnippet += '\n)\n';
      sdkSnippet += 'print(extract_result)';
    } else {
      return snippet
        .replace(/https:\/\/api\.example\.com/g, 'https://api.firecrawl.dev/v1')
        .replace(/'Authorization': 'Bearer [^']+/g, `'Authorization': 'Bearer ${apiKey}'`);
    }
    
    return sdkSnippet;
  }

  /**
   * Generate a response example for the given endpoint
   */
  private generateResponseExample(endpoint: string, method: string): string {
    const pathObj = this.openApiSpec.paths[endpoint];
    if (!pathObj) return '{}';
    
    const methodObj = pathObj[method.toLowerCase()];
    if (!methodObj) return '{}';
    
    const responses = methodObj.responses;
    if (!responses || !responses['200']) return '{}';
    
    const content = responses['200'].content;
    if (!content || !content['application/json']) return '{}';
    
    const schema = content['application/json'].schema;
    if (!schema) return '{}';
    
    return this.generateSampleFromSchema(schema);
  }

  /**
   * Generate a sample JSON object from a JSON schema
   */
  private generateSampleFromSchema(schema: any, depth: number = 0): string {
    if (depth > 3) {
      return '{}';
    }
    
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let refObj = this.openApiSpec;
      
      for (const segment of refPath) {
        refObj = refObj[segment];
      }
      
      return this.generateSampleFromSchema(refObj, depth + 1);
    }
    
    if (schema.type === 'object') {
      let result = '{\n';
      const properties = schema.properties || {};
      
      for (const [key, prop] of Object.entries(properties)) {
        result += `  "${key}": ${this.generateSampleValue(prop as any, depth + 1)},\n`;
      }
      
      if (Object.keys(properties).length > 0) {
        result = result.slice(0, -2) + '\n';
      }
      
      result += '}';
      return result;
    } else if (schema.type === 'array') {
      if (schema.items) {
        return `[${this.generateSampleValue(schema.items, depth + 1)}]`;
      }
      return '[]';
    } else {
      return this.generateSampleValue(schema, depth + 1);
    }
  }

  /**
   * Generate a sample value for a schema property
   */
  private generateSampleValue(schema: any, depth: number): string {
    if (schema.$ref) {
      return this.generateSampleFromSchema(schema, depth);
    }
    
    if (schema.example !== undefined) {
      if (typeof schema.example === 'string') {
        return `"${schema.example}"`;
      }
      return JSON.stringify(schema.example);
    }
    
    if (schema.enum && schema.enum.length > 0) {
      if (typeof schema.enum[0] === 'string') {
        return `"${schema.enum[0]}"`;
      }
      return JSON.stringify(schema.enum[0]);
    }
    
    switch (schema.type) {
      case 'string':
        if (schema.format === 'date-time') {
          return '"2023-01-01T00:00:00Z"';
        }
        if (schema.format === 'uri') {
          return '"https://firecrawl.dev"';
        }
        return '"example"';
      case 'integer':
      case 'number':
        return '42';
      case 'boolean':
        return 'true';
      case 'object':
        return this.generateSampleFromSchema(schema, depth);
      case 'array':
        if (schema.items) {
          return `[${this.generateSampleValue(schema.items, depth)}]`;
        }
        return '[]';
      default:
        return '{}';
    }
  }

  /**
   * Generate snippet files for Mintlify documentation
   */
  public generateMintlifySnippets(outputDir: string, options: SnippetOptions = {}): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const allSnippets = this.generateAllSnippets(options);
    
    for (const [operationId, snippets] of Object.entries(allSnippets)) {
      let category = 'misc';
      
      if (operationId.includes('scrape')) {
        category = 'scrape';
      } else if (operationId.includes('crawl')) {
        category = 'crawl';
      } else if (operationId.includes('map')) {
        category = 'map';
      } else if (operationId.includes('extract')) {
        category = 'extract';
      }
      
      const categoryDir = path.join(outputDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      
      const operationDir = path.join(categoryDir, operationId);
      if (!fs.existsSync(operationDir)) {
        fs.mkdirSync(operationDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(operationDir, 'curl.mdx'),
        `\`\`\`bash cURL\n${snippets.curl}\n\`\`\`\n`
      );
      
      fs.writeFileSync(
        path.join(operationDir, 'js.mdx'),
        `\`\`\`js Node\n${snippets.javascript}\n\`\`\`\n`
      );
      
      fs.writeFileSync(
        path.join(operationDir, 'python.mdx'),
        `\`\`\`python Python\n${snippets.python}\n\`\`\`\n`
      );
      
      fs.writeFileSync(
        path.join(operationDir, 'response.mdx'),
        `\`\`\`json Response\n${snippets.response}\n\`\`\`\n`
      );
    }
  }
}
