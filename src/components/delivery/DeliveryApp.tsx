import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { MenuItem, WhatsAppOrderItem } from '../../types';
import { WhatsAppService } from '../../services/whatsappService';
import {
  ArrowLeft,
  Bike,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

type CartLine = {
  key: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
};

type Step = 'menu' | 'cart' | 'checkout' | 'paying';

const DELIVERY_FEE = 5.9;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

export const DeliveryApp: React.FC = () => {
  const { state } = useRestaurant();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [step, setStep] = useState<Step>('menu');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  const availableMenu = useMemo(
    () => state.menu.filter((item) => item.isAvailable),
    [state.menu]
  );

  const categories = useMemo(() => {
    const set = new Set(availableMenu.map((item) => item.category));
    return Array.from(set);
  }, [availableMenu]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableMenu.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [availableMenu, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filteredMenu.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [filteredMenu]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.menuItem.price * line.quantity,
    0
  );
  const total = subtotal + (cart.length > 0 ? DELIVERY_FEE : 0);

  useEffect(() => {
    if (activeCategory === 'all') return;
    const el = categoryRefs.current[activeCategory];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory]);

  const openItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQty(1);
    setItemNotes('');
  };

  const addSelectedToCart = () => {
    if (!selectedItem) return;
    const key = `${selectedItem.id}::${itemNotes.trim()}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      if (existing) {
        return prev.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + itemQty } : line
        );
      }
      return [
        ...prev,
        {
          key,
          menuItem: selectedItem,
          quantity: itemQty,
          notes: itemNotes.trim() || undefined,
        },
      ];
    });
    setSelectedItem(null);
  };

  const updateQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + delta } : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const removeLine = (key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key));
  };

  const handlePay = async () => {
    setError('');
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError('Preencha nome, telefone e endereço de entrega.');
      return;
    }
    if (cart.length === 0) {
      setError('Adicione itens ao carrinho.');
      return;
    }

    setIsSubmitting(true);
    setStep('paying');

    try {
      // Simula confirmação do pagamento online
      if (paymentMethod !== 'cash') {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const items: WhatsAppOrderItem[] = cart.map((line) => ({
        id: `${line.key}-${Date.now()}`,
        menuItemId: line.menuItem.id,
        menuItemSnapshot: line.menuItem,
        quantity: line.quantity,
        notes: line.notes,
      }));

      const order = await WhatsAppService.createDeliveryOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
        notes: orderNotes.trim() || undefined,
        deliveryFee: DELIVERY_FEE,
      });

      if (!order) {
        setError('Não foi possível criar o pedido. Tente novamente.');
        setStep('checkout');
        return;
      }

      setCart([]);
      navigate(`/delivery/pedido/${order.id}`);
    } catch (err) {
      console.error(err);
      setError('Falha no pagamento. Tente novamente.');
      setStep('checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-28">
      <header className="sticky top-0 z-30 border-b border-red-800/20 bg-[#ea1d2c] text-white shadow-md">
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
              <Bike className="h-5 w-5 shrink-0" />
              <h1 className="truncate text-lg font-bold">Delivery</h1>
            </div>
            <p className="truncate text-xs text-red-100">
              Cardápio completo · entrega em casa
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="relative rounded-full bg-white/15 p-2 hover:bg-white/25"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-[#ea1d2c]">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardápio"
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 shadow-sm outline-none ring-0 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-3">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-white text-[#ea1d2c]'
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
                  ? 'bg-white text-[#ea1d2c]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-5">
        {grouped.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Nenhum item disponível no cardápio
          </div>
        ) : (
          grouped.map(([category, items]) => (
            <section
              key={category}
              ref={(el) => {
                categoryRefs.current[category] = el;
              }}
              className="scroll-mt-40"
            >
              <h2 className="mb-3 text-xl font-bold text-gray-900">{category}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {item.description}
                      </p>
                      <p className="mt-2 font-bold text-[#ea1d2c]">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    {item.imageUrl ? (
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 rounded-full bg-[#ea1d2c] p-1.5 text-white shadow">
                          <Plus className="h-4 w-4" />
                        </span>
                      </div>
                    ) : (
                      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#ea1d2c]">
                        <Plus className="h-6 w-6" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {cartCount > 0 && step === 'menu' && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4">
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl bg-[#ea1d2c] px-5 py-4 text-white shadow-xl"
          >
            <span className="rounded-lg bg-black/15 px-2.5 py-1 text-sm font-bold">
              {cartCount}
            </span>
            <span className="font-semibold">Ver sacola</span>
            <span className="font-bold">{formatPrice(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Item modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl">
            {selectedItem.imageUrl && (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="h-48 w-full object-cover"
              />
            )}
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedItem.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{selectedItem.description}</p>
                  <p className="mt-2 text-lg font-bold text-[#ea1d2c]">
                    {formatPrice(selectedItem.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-full bg-gray-100 p-2 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: sem cebola, ponto da carne..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#ea1d2c]"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setItemQty((q) => Math.max(1, q - 1))}
                    className="p-2 text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-semibold">{itemQty}</span>
                  <button
                    type="button"
                    onClick={() => setItemQty((q) => q + 1)}
                    className="p-2 text-gray-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addSelectedToCart}
                  className="flex-1 rounded-xl bg-[#ea1d2c] py-3 font-semibold text-white"
                >
                  Adicionar · {formatPrice(selectedItem.price * itemQty)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart / Checkout drawer */}
      {(step === 'cart' || step === 'checkout' || step === 'paying') && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {step === 'cart' && 'Sacola'}
                {step === 'checkout' && 'Finalizar pedido'}
                {step === 'paying' && 'Processando pagamento'}
              </h2>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep('menu')}
                className="rounded-full bg-gray-100 p-2 text-gray-500 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {step === 'paying' ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#ea1d2c]" />
                  <p className="font-semibold text-gray-800">
                    {paymentMethod === 'cash'
                      ? 'Registrando pedido...'
                      : 'Confirmando pagamento...'}
                  </p>
                  <p className="text-sm text-gray-500">Aguarde um instante</p>
                </div>
              ) : step === 'cart' ? (
                cart.length === 0 ? (
                  <p className="py-10 text-center text-gray-500">Sacola vazia</p>
                ) : (
                  <>
                    {cart.map((line) => (
                      <div
                        key={line.key}
                        className="flex gap-3 rounded-2xl border border-gray-100 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">{line.menuItem.name}</p>
                          {line.notes && (
                            <p className="text-xs italic text-gray-500">{line.notes}</p>
                          )}
                          <p className="mt-1 text-sm font-medium text-[#ea1d2c]">
                            {formatPrice(line.menuItem.price * line.quantity)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() => updateQty(line.key, -1)}
                              className="p-1.5"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(line.key, 1)}
                              className="p-1.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-1 rounded-2xl bg-gray-50 p-4 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Taxa de entrega</span>
                        <span>{formatPrice(DELIVERY_FEE)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4" /> Nome
                      </span>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#ea1d2c]"
                        placeholder="Seu nome"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4" /> Telefone
                      </span>
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#ea1d2c]"
                        placeholder="(00) 00000-0000"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4" /> Endereço de entrega
                      </span>
                      <textarea
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#ea1d2c]"
                        placeholder="Rua, número, bairro, complemento"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-gray-700">
                        Observações do pedido
                      </span>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#ea1d2c]"
                        placeholder="Opcional"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-800">
                      Forma de pagamento
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'pix', label: 'Pix', icon: QrCode },
                          { id: 'card', label: 'Cartão', icon: CreditCard },
                          { id: 'cash', label: 'Dinheiro', icon: Banknote },
                        ] as const
                      ).map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                            paymentMethod === id
                              ? 'border-[#ea1d2c] bg-red-50 text-[#ea1d2c]'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {paymentMethod === 'cash'
                        ? 'Pagamento na entrega. O pedido já aparece no painel.'
                        : 'Pagamento online simulado — após confirmar, o pedido vai ao painel.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4 text-sm">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total a pagar</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>

            {step !== 'paying' && (
              <div className="border-t border-gray-100 p-4">
                {step === 'cart' ? (
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => setStep('checkout')}
                    className="w-full rounded-xl bg-[#ea1d2c] py-3.5 font-semibold text-white disabled:opacity-50"
                  >
                    Continuar · {formatPrice(total)}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('cart')}
                      className="rounded-xl border border-gray-200 px-4 py-3.5 font-semibold text-gray-700"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ea1d2c] py-3.5 font-semibold text-white disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      {paymentMethod === 'cash' ? 'Confirmar pedido' : 'Pagar agora'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
