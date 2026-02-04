import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve('node_modules/discoui/dist/discoui.css');
const outputPath = path.resolve('src/css.js');

if (!fs.existsSync(cssPath)) {
  console.error('CSS file not found at:', cssPath);
  process.exit(1);
}

const cssContent = fs.readFileSync(cssPath, 'utf-8');
// Escape backticks and backslashes for template literal
const escapedCss = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

const jsContent = `export const cssContent = \`${escapedCss}\`;\n`;

fs.writeFileSync(outputPath, jsContent);
console.log(`Generated ${outputPath} from ${cssPath}`);
