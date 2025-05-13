#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { CustomSnippetGenerator } from './custom-snippet-generator';

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.error('Please provide a command: generate-snippets or generate-docs');
  process.exit(1);
}

const specPathArg = args.find(arg => arg.startsWith('--spec='));
if (!specPathArg) {
  console.error('Please provide the OpenAPI spec path with --spec=/path/to/openapi.json');
  process.exit(1);
}
const specPath = specPathArg.split('=')[1];

const outputDirArg = args.find(arg => arg.startsWith('--output='));
if (!outputDirArg) {
  console.error('Please provide the output directory with --output=/path/to/output');
  process.exit(1);
}
const outputDir = outputDirArg.split('=')[1];

const urlArg = args.find(arg => arg.startsWith('--url='));
const url = urlArg ? urlArg.split('=')[1] : 'https://firecrawl.dev';

const formatsArg = args.find(arg => arg.startsWith('--formats='));
const formats = formatsArg ? formatsArg.split('=')[1].split(',') : ['markdown', 'html'];

const options = {
  url,
  formats
};

const generator = new CustomSnippetGenerator(specPath);

if (command === 'generate-snippets') {
  generator.generateMintlifySnippets(outputDir, options);
  console.log(`Generated snippets in ${outputDir}`);
} else if (command === 'generate-docs') {
  console.error('Documentation generation not yet implemented');
  process.exit(1);
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
