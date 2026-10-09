import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

// Load env from environment.ts by reading source
const envSource = fs.readFileSync('src/config/environment.ts', 'utf8');
const url = envSource.match(/url:\s*'([^']+)'/)?.[1];
const anonKey = envSource.match(/anonKey:\s*'([^']+)'/)?.[1];

if (!url || !anonKey) {
  console.error('Missing supabase credentials in environment.ts');
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync('allegro-items.json', 'utf8'));
const sb = createClient(url, anonKey);

console.log(`Importing ${items.length} items into ${url}...`);

const { error: delError } = await sb.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
if (delError) {
  console.error('Delete failed:', delError.message);
  process.exit(1);
}

const rows = items.map((i) => ({
  name: i.name,
  description: i.description,
  price: i.price,
  category: i.category,
  station: i.station,
  is_available: true,
}));

// Insert in chunks
const chunkSize = 25;
let inserted = 0;
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const { data, error } = await sb.from('menu_items').insert(chunk).select('id');
  if (error) {
    console.error('Insert failed at chunk', i, error.message);
    process.exit(1);
  }
  inserted += data?.length || 0;
  console.log(`Inserted ${inserted}/${rows.length}`);
}

const { data: counts } = await sb.from('menu_items').select('category');
const byCat = {};
for (const row of counts || []) {
  byCat[row.category] = (byCat[row.category] || 0) + 1;
}
console.log('Done. By category:', byCat);
