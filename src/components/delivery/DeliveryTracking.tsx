import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WhatsAppService } from '../../services/whatsappService';
import { WhatsAppOrder } from '../../types';
import {
  ArrowLeft,
  Bike,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  Package,
  Truck,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';

const STEPS: {
  id: WhatsAppOrder['status'];
  label: string;
  description: string;
  icon: typeof Clock;
}[] = [
  {
    id: 'pending',
    label: 'Pedido recebido',
    description: 'Seu pedido chegou ao restaurante',
    icon: Clock,
  },
  {
    id: 'confirmed',
    label: 'Confirmado',
    description: 'O restaurante aceitou o pedido',
    icon: CheckCircle2,
  },
  {
    id: 'preparing',
    label: 'Preparando',
    description: 'A cozinha está preparando',
    icon: Flame,
  },
  {
    id: 'ready',
    label: 'Saiu / Pronto',
    description: 'Pedido pronto para entrega',
    icon: Package,
  },
  {
    id: 'delivered',
    label: 'Entregue',
    description: 'Pedido entregue com sucesso',
    icon: Truck,
  },
];

const STATUS_ORDER = STEPS.map((s) => s.id);

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

function paymentLabel(method?: string) {
  switch (method) {
    case 'pix':
      return 'Pix';
    case 'card':
      return 'Cartão';
    case 'cash':
      return 'Dinheiro na entrega';
    default:
      return method || '—';
  }
}

function paymentStatusInfo(status?: string) {
  switch (status) {
    case 'completed':
      return {
        label: 'Pagamento confirmado',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'failed':
      return {
        label: 'Pagamento falhou',
        className: 'bg-red-50 text-red-700 border-red-200',
      };
    default:
      return {
        label: 'Pagamento pendente',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      };
  }
}

export const DeliveryTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<WhatsAppOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!orderId) return;
    try {
      const data = await WhatsAppService.getWhatsAppOrderById(orderId);
      if (!data) {
        setError('Pedido não encontrado');
        setOrder(null);
      } else {
        setOrder(data);
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const currentIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === 'cancelled') return -1;
    const idx = STATUS_ORDER.indexOf(order.status);
    return idx >= 0 ? idx : 0;
  }, [order]);

  const progressPercent = useMemo(() => {
    if (!order || order.status === 'cancelled') return 0;
    if (STATUS_ORDER.length <= 1) return 100;
    return Math.round((currentIndex / (STATUS_ORDER.length - 1)) * 100);
  }, [currentIndex, order]);

  const payInfo = paymentStatusInfo(order?.paymentStatus);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="border-b border-red-800/20 bg-[#ea1d2c] text-white">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Link
            to="/delivery"
            className="rounded-full bg-white/15 p-2 hover:bg-white/25"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5" />
              <h1 className="text-lg font-bold">Acompanhar pedido</h1>
            </div>
            <p className="truncate text-xs text-red-100">
              Atualiza automaticamente com o painel
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-full bg-white/15 p-2 hover:bg-white/25"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
        {loading && !order ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#ea1d2c]" />
            Carregando pedido...
          </div>
        ) : error && !order ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-700">{error}</p>
            <Link
              to="/delivery"
              className="mt-4 inline-block font-semibold text-[#ea1d2c]"
            >
              Voltar ao cardápio
            </Link>
          </div>
        ) : order ? (
          <>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Pedido</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    #{order.id.replace('delivery-', '').slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${payInfo.className}`}
                >
                  {payInfo.label}
                </div>
              </div>

              {order.status === 'cancelled' ? (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Pedido cancelado pelo restaurante
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-800">
                      {STEPS[currentIndex]?.label || 'Em andamento'}
                    </span>
                    <span className="tabular-nums text-gray-500">{progressPercent}%</span>
                  </div>
                  <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#ea1d2c] transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <ol className="space-y-0">
                    {STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const done = index < currentIndex;
                      const current = index === currentIndex;
                      return (
                        <li key={step.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                                done
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : current
                                    ? 'border-[#ea1d2c] bg-[#ea1d2c] text-white'
                                    : 'border-gray-200 bg-white text-gray-300'
                              }`}
                            >
                              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </span>
                            {index < STEPS.length - 1 && (
                              <span
                                className={`w-0.5 flex-1 min-h-[28px] ${
                                  done ? 'bg-emerald-400' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                          <div className={`pb-5 ${current ? '' : 'opacity-70'}`}>
                            <p
                              className={`text-sm font-semibold ${
                                current ? 'text-[#ea1d2c]' : 'text-gray-800'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Pagamento
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#ea1d2c]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {paymentLabel(order.paymentMethod)}
                  </p>
                  <p className="text-sm text-gray-500">{payInfo.label}</p>
                </div>
                <p className="ml-auto font-bold text-gray-900">{formatPrice(order.total)}</p>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Entrega
              </h2>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ea1d2c]" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {order.customerName || 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  <p className="mt-1 text-sm text-gray-600">{order.customerAddress}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Itens
              </h2>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.quantity}x {item.menuItemSnapshot?.name || 'Item'}
                      </p>
                      {item.notes && (
                        <p className="text-xs italic text-gray-500">{item.notes}</p>
                      )}
                    </div>
                    <p className="shrink-0 font-medium text-gray-700">
                      {formatPrice(
                        (item.menuItemSnapshot?.price || 0) * item.quantity
                      )}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Entrega</span>
                  <span>{formatPrice(order.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>

            <Link
              to="/delivery"
              className="block rounded-2xl border border-[#ea1d2c] py-3 text-center font-semibold text-[#ea1d2c]"
            >
              Fazer novo pedido
            </Link>
          </>
        ) : null}
      </main>
    </div>
  );
};
