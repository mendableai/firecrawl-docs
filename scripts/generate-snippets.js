const path = require('path');
const { CustomSnippetGenerator } = require('../packages/firecrawl-openapi-tools');

const specPath = path.resolve(__dirname, '../api-reference/v1-openapi.json');

const outputDir = path.resolve(__dirname, '../snippets/v1');

const generator = new CustomSnippetGenerator(specPath);

generator.generateMintlifySnippets(outputDir, {
  url: 'https://firecrawl.dev',
  formats: ['markdown', 'html']
});

console.log(`Generated snippets in ${outputDir}`);
