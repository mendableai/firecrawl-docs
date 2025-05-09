import * as path from 'path';
import { FirecrawlSnippetGenerator } from '../src/snippet-generator';

const specPath = path.resolve(__dirname, '../../firecrawl-docs/api-reference/v1-openapi.json');

const generator = new FirecrawlSnippetGenerator(specPath);

const scrapeSnippets = generator.generateEndpointSnippets('/scrape', 'POST', {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html'],
  onlyMainContent: true
});

console.log('JavaScript Snippet:');
console.log(scrapeSnippets.javascript);
console.log('\nPython Snippet:');
console.log(scrapeSnippets.python);
console.log('\ncURL Snippet:');
console.log(scrapeSnippets.curl);

const outputDir = path.resolve(__dirname, '../output/snippets');
generator.generateMintlifySnippets(outputDir, {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html']
});

console.log(`\nGenerated Mintlify snippets in ${outputDir}`);
