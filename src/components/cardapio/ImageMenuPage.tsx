import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ImageOff, Search } from 'lucide-react';
import { MenuItem } from '../../types';
import { MenuFormatNav } from './MenuFormatNav';
import { formatMenuPrice, usePublicMenu } from './usePublicMenu';

export const ImageMenuPage: React.FC = () => {
  const { menu, loading, error } = usePublicMenu();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
        (item.description || '').toLowerCase().includes(q) ||
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
    <div className="min-h-screen bg-white text-[#3e3e3e]">
      <header className="sticky top-0 z-20 border-b border-[#f0f0f0] bg-white">
        <div className="mx-auto flex max-w-[680px] items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="rounded-full p-2 text-[#3e3e3e] transition hover:bg-[#f5f5f5]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">Cardápio</h1>
            <p className="truncate text-xs text-[#717171]">Fotos dos pratos</p>
          </div>
        </div>
        <div className="mx-auto max-w-[680px] overflow-x-auto px-4 pb-3">
          <MenuFormatNav />
        </div>

        <div className="mx-auto max-w-[680px] px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a9a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardápio"
              className="w-full rounded-lg bg-[#f5f5f5] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-[#9a9a9a]"
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-[680px] gap-2 overflow-x-auto px-4 pb-3">
          <CategoryChip
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            label="Todos"
          />
          {categories.map((category) => (
            <CategoryChip
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              label={category}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[680px] px-4 pb-10 pt-2">
        {loading && <p className="py-16 text-center text-sm text-[#717171]">Carregando cardápio...</p>}
        {!loading && error && <p className="py-16 text-center text-sm text-red-600">{error}</p>}
        {!loading && !error && grouped.length === 0 && (
          <p className="py-16 text-center text-sm text-[#717171]">Nenhum item disponível no cardápio</p>
        )}

        {!loading &&
          !error &&
          grouped.map(([category, items]) => (
            <section key={category} className="pt-5">
              <h2 className="mb-1 text-[22px] font-bold leading-tight text-[#3e3e3e]">{category}</h2>
              <div>
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-start gap-3 border-b border-[#f0f0f0] py-4"
                  >
                    <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-lg bg-[#f2f2f2]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#b5b5b5]">
                          <ImageOff className="h-5 w-5" />
                          <span className="text-[10px]">Sem foto</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-[15px] font-semibold leading-snug text-[#3e3e3e]">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#717171]">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 text-[15px] font-bold text-[#3e3e3e]">
                        {formatMenuPrice(item.price)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
};

const CategoryChip: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({
  active,
  onClick,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-[#3e3e3e] text-white' : 'bg-[#f2f2f2] text-[#3e3e3e] hover:bg-[#e8e8e8]'
    }`}
  >
    {label}
  </button>
);
