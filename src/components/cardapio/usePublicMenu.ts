import { useEffect, useState } from 'react';
import { DatabaseService } from '../../services/databaseService';
import { MenuItem } from '../../types';

const SHOWCASE_CATEGORIES = ['Pratos', 'Carnes', 'Massas', 'Sobremesas'];
const SHOWCASE_PER_CATEGORY = 3;

export function formatMenuPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export function takeShowcaseMenu(items: MenuItem[]): MenuItem[] {
  return SHOWCASE_CATEGORIES.flatMap((category) =>
    items.filter((item) => item.category === category).slice(0, SHOWCASE_PER_CATEGORY)
  );
}

export function usePublicMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const items = await DatabaseService.getMenuItems();
        if (!active) return;
        setMenu(items.filter((item) => item.isAvailable));
      } catch (err) {
        console.error(err);
        if (active) setError('Não foi possível carregar o cardápio.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return { menu, loading, error };
}
