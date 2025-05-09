export interface SnippetOptions {
  apiKey?: string;
  url?: string;
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
}

export interface GeneratedSnippet {
  language: string;
  code: string;
}

export interface EndpointSnippets {
  curl: string;
  javascript: string;
  python: string;
  response: string;
}
