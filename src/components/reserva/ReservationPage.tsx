import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Users, Phone, ArrowLeft } from 'lucide-react';
import { ReservationService } from '../../services/reservationService';

function getMinDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export const ReservationPage: React.FC = () => {
  const [minDateTime] = useState(getMinDateTime);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [reservedAt, setReservedAt] = useState(minDateTime);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim() || !customerPhone.trim() || !reservedAt) {
      setError('Preencha nome, telefone e data/hora da reserva.');
      return;
    }

    if (partySize < 1) {
      setError('Informe a quantidade de pessoas.');
      return;
    }

    const date = new Date(reservedAt);
    if (Number.isNaN(date.getTime()) || date.getTime() < Date.now() - 60_000) {
      setError('Escolha uma data e horário futuros.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await ReservationService.createReservation({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        partySize,
        reservedAt: date,
        notes: notes || undefined,
      });

      if (!created) {
        setError('Não foi possível enviar a solicitação. Tente novamente.');
        return;
      }

      setSuccess(true);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setPartySize(2);
      setReservedAt(minDateTime);
      setNotes('');
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar solicitação de reserva.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reservar mesa</h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Envie sua solicitação. O restaurante confirma e entra em contato.
            </p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
              <h2 className="text-xl font-bold text-emerald-800">Solicitação enviada!</h2>
              <p className="mt-2 text-sm text-emerald-700">
                Em breve confirmaremos sua reserva. Fique atento ao telefone informado.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Nova solicitação
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefone *</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  placeholder="opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Pessoas *</label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={partySize}
                      onChange={(e) => setPartySize(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-3 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Data e hora *</label>
                  <input
                    type="datetime-local"
                    value={reservedAt}
                    min={minDateTime}
                    onChange={(e) => setReservedAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  placeholder="Aniversário, preferência de praça, etc."
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
              >
                {isLoading ? 'Enviando...' : 'Solicitar reserva'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
