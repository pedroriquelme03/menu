import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../../services/databaseService';
import { MenuItem } from '../../types';
import { ArrowLeft, Search, UtensilsCrossed } from 'lucide-react';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

export const PublicMenuPage: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const items = await DatabaseService.getMenuItems();
        setMenu(items.filter((item) => item.isAvailable));
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o cardápio.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(menu.map((item) => item.category))),
    [menu]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [menu, activeCategory, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-20 border-b border-orange-800/10 bg-[#ea580c] text-white shadow-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 shrink-0" />
              <h1 className="truncate text-lg font-bold">Cardápio</h1>
            </div>
            <p className="truncate text-xs text-orange-100">
              Visualização pública · sem precisar escolher mesa
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardápio"
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-white text-orange-700'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === category
                  ? 'bg-white text-orange-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-5">
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Carregando cardápio...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-10 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Nenhum item disponível no cardápio
          </div>
        )}

        {!loading &&
          !error &&
          grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 text-xl font-bold text-gray-900">{category}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="shrink-0 font-bold text-orange-600">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    {item.imageUrl && (
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
};
