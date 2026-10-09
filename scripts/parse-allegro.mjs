import fs from 'fs';

const html = fs.readFileSync('allegro.html', 'utf8');
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|h[1-6]|li|tr|span)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8211;/g, '-')
  .replace(/&#8220;|&#8221;|&quot;/g, '"')
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n+/g, '\n')
  .trim();

fs.writeFileSync('allegro.txt', text);
console.log('lines', text.split('\n').length);
console.log(text.slice(0, 5000));
