const path = require('path');
const { FirecrawlSnippetGenerator } = require('firecrawl-openapi-tools');

const specPath = path.resolve(__dirname, '../api-reference/v1-openapi.json');

const outputDir = path.resolve(__dirname, '../snippets/v1');

const generator = new FirecrawlSnippetGenerator(specPath);

generator.generateMintlifySnippets(outputDir, {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html']
});

console.log(`Generated snippets in ${outputDir}`);
