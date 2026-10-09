import fs from 'fs';

const CATEGORIES = [
  'Pratos',
  'Saladas',
  'Sopas',
  'Carnes',
  'Peixes',
  'Aves',
  'Massas',
  'Risotos',
  'Sobremesas',
  'Cafés e Chás',
  'Bebidas',
  'Sucos',
  'Sucos Especiais',
  'Coquetéis',
  'Caipirinhas Especiais',
  'Caipirinhas',
  'Destilados',
  'Licores',
  'Whisky',
  'Cervejas',
  'Cervejas Especiais',
  'Kids',
];

const SKIP = new Set([
  'Allegro',
  'Sabores para aproveitar',
  'A La Carte',
  'Cardápios - Allegro - A La Carte',
  'Visualizar cardápio A La Carte',
  'Bar Gaia',
  'Carta de Vinhos',
  'Frigobar',
  'Restaurente Allegro',
  'Restaurante Terrazza',
  'Room Service',
  'Contatos',
]);

const text = fs.readFileSync('allegro.txt', 'utf8');
const lines = text
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const startIdx = lines.findIndex((l) => l === 'Cardápios - Allegro - A La Carte');
const slice = lines.slice(startIdx >= 0 ? startIdx + 1 : 0);

// Skip the first category index block (nav only) until we hit the first real section again
let bodyStart = 0;
const firstCat = slice.findIndex((l) => l === 'Pratos');
const secondPratos = slice.findIndex((l, i) => i > firstCat && l === 'Pratos');
if (secondPratos > 0) bodyStart = secondPratos;

const body = slice.slice(bodyStart);
const categorySet = new Set(CATEGORIES);
const items = [];
let currentCategory = 'Pratos';

function isPrice(line) {
  return /^R\$\s*\d+([.,]\d{2})?$/.test(line);
}

function parsePrice(line) {
  const m = line.match(/R\$\s*(\d+)(?:[.,](\d{2}))?/);
  if (!m) return null;
  const cents = m[2] || '00';
  return Number(`${m[1]}.${cents}`);
}

function stationFor(category) {
  const c = category.toLowerCase();
  if (
    c.includes('bebida') ||
    c.includes('suco') ||
    c.includes('café') ||
    c.includes('cafe') ||
    c.includes('chá') ||
    c.includes('cha') ||
    c.includes('coquet') ||
    c.includes('caipirinha') ||
    c.includes('destilado') ||
    c.includes('licor') ||
    c.includes('whisky') ||
    c.includes('cerveja')
  ) {
    return 'cambuza';
  }
  return 'kitchen';
}

for (let i = 0; i < body.length; i++) {
  const line = body[i];
  if (categorySet.has(line)) {
    currentCategory = line;
    continue;
  }
  if (SKIP.has(line)) continue;
  if (isPrice(line)) continue;
  if (line.startsWith('+55') || line.startsWith('0800') || line.startsWith('Av.')) break;
  if (line.toLowerCase().includes('todos os detalhes')) break;

  // Title candidate: next non-empty could be price then description
  const next = body[i + 1];
  const next2 = body[i + 2];
  if (!next) continue;

  if (isPrice(next)) {
    const price = parsePrice(next);
    let description = '';
    let advance = 1;
    if (next2 && !isPrice(next2) && !categorySet.has(next2) && !SKIP.has(next2)) {
      // description may span one or more lines until next title/category/price
      const descParts = [];
      let j = i + 2;
      while (j < body.length) {
        const l = body[j];
        if (categorySet.has(l) || SKIP.has(l) || isPrice(l)) break;
        // Heuristic: next item title is usually followed by a price
        const peek = body[j + 1];
        if (peek && isPrice(peek)) break;
        // Also stop if this looks like a short title followed by category change later
        if (
          descParts.length > 0 &&
          l.length < 45 &&
          peek &&
          !isPrice(peek) &&
          !categorySet.has(peek) &&
          body[j + 2] &&
          isPrice(body[j + 2])
        ) {
          break;
        }
        descParts.push(l);
        j++;
        if (descParts.join(' ').length > 400) break;
      }
      description = descParts.join(' ').trim();
      advance = j - i - 1;
    }

    items.push({
      name: line,
      description: description || line,
      price,
      category: currentCategory,
      station: stationFor(currentCategory),
      is_available: true,
    });
    i += advance;
  }
}

// Deduplicate by name+category
const seen = new Set();
const unique = [];
for (const item of items) {
  const key = `${item.category}::${item.name}`.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(item);
}

fs.writeFileSync('allegro-items.json', JSON.stringify(unique, null, 2));
console.log(`Parsed ${unique.length} items`);
const byCat = {};
for (const item of unique) {
  byCat[item.category] = (byCat[item.category] || 0) + 1;
}
console.log(byCat);
console.log('sample', unique.slice(0, 5));
console.log('tail', unique.slice(-5));
