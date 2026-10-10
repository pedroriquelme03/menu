import { useEffect, useState } from 'react';
import { DatabaseService } from '../../services/databaseService';
import { MenuItem } from '../../types';

export function formatMenuPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
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
