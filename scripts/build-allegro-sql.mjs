import fs from 'fs';

const items = JSON.parse(fs.readFileSync('allegro-items.json', 'utf8')).map((i) => {
  if (i.name === 'Espaguete' && i.category === 'Kids') {
    return {
      ...i,
      description: '150g. Escolha molho pomodoro ou queijo.',
    };
  }
  // Clean footer pollution if any
  return {
    ...i,
    description: i.description
      .replace(/\s*O Resort Sobre nós.*$/i, '')
      .replace(/\s*Galéria Blog Spa.*$/i, '')
      .trim(),
  };
});

function esc(s) {
  return String(s ?? '').replace(/'/g, "''");
}

const values = items
  .map(
    (i) =>
      `('${esc(i.name)}', '${esc(i.description)}', ${Number(i.price)}, '${esc(i.category)}', '${i.station}', true)`
  )
  .join(',\n');

const sql = `DELETE FROM menu_items;
INSERT INTO menu_items (name, description, price, category, station, is_available) VALUES
${values};`;

fs.writeFileSync('allegro-insert.sql', sql);
fs.writeFileSync('allegro-items.json', JSON.stringify(items, null, 2));
console.log(`Ready: ${items.length} items`);
