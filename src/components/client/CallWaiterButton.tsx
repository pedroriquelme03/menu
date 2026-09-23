import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { WaiterCallService } from '../../services/waiterCallService';

interface CallWaiterButtonProps {
  tableId: string;
  seatId?: string;
  tableNumber: number;
}

export const CallWaiterButton: React.FC<CallWaiterButtonProps> = ({
  tableId,
  seatId,
  tableNumber,
}) => {
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let active = true;

    const checkPending = async () => {
      const call = await WaiterCallService.getPendingCallForTable(tableId);
      if (active) setPending(Boolean(call));
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [tableId]);

  const handleCall = async () => {
    if (pending || loading) return;

    setLoading(true);
    setFeedback('');

    try {
      const call = await WaiterCallService.callWaiter({
        tableId,
        seatId,
        reason: 'assistencia',
      });

      if (call) {
        setPending(true);
        setFeedback(`Garçom chamado para a mesa ${tableNumber}`);
      } else {
        setFeedback('Não foi possível chamar o garçom. Tente de novo.');
      }
    } catch (error) {
      console.error(error);
      setFeedback('Erro ao chamar o garçom.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCall}
        disabled={loading || pending}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
          pending
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        } disabled:cursor-not-allowed`}
        title={pending ? 'Garçom já foi chamado' : 'Chamar garçom'}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : pending ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {pending ? 'Garçom a caminho' : 'Chamar garçom'}
        </span>
      </button>

      {feedback && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          {feedback}
        </div>
      )}
    </div>
  );
};
