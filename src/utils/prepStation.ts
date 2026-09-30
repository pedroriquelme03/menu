import { MenuItem, OrderItem, PrepStation, WhatsAppOrderItem } from '../types';

export function resolveItemStation(
  item: OrderItem | WhatsAppOrderItem | { menuItemSnapshot?: MenuItem }
): PrepStation {
  const snap = item.menuItemSnapshot;
  if (snap?.station === 'kitchen' || snap?.station === 'cambuza') {
    return snap.station;
  }

  const category = (snap?.category || '').toLowerCase();
  const name = (snap?.name || '').toLowerCase();
  if (
    category.includes('bebida') ||
    name.includes('água') ||
    name.includes('agua') ||
    name.includes('refrigerante') ||
    name.includes('coca') ||
    name.includes('suco') ||
    name.includes('cerveja')
  ) {
    return 'cambuza';
  }

  return 'kitchen';
}

export function filterItemsByStation<T extends { menuItemSnapshot?: MenuItem }>(
  items: T[],
  station: PrepStation
): T[] {
  return items.filter((item) => resolveItemStation(item) === station);
}

export function orderHasStationItems(
  items: { menuItemSnapshot?: MenuItem }[],
  station: PrepStation
): boolean {
  return filterItemsByStation(items, station).length > 0;
}

export function stationLabel(station: PrepStation): string {
  return station === 'cambuza' ? 'Cambuza' : 'Cozinha';
}
