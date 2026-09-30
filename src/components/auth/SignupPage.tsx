import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountService } from '../../services/accountService';
import {
  PLAN_CATALOG,
  PlanId,
  isValidPlanId,
} from '../../types/billing';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const SignupPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialPlan = isValidPlanId(params.get('plano'))
    ? (params.get('plano') as PlanId)
    : 'profissional';

  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [ownerName, setOwnerName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const plan = useMemo(() => PLAN_CATALOG[planId], [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ownerName.trim() || !restaurantName.trim() || !email.trim() || password.length < 6) {
      setError('Preencha nome, restaurante, e-mail e senha (mín. 6 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AccountService.signUpTrial({
        ownerName,
        restaurantName,
        email,
        phone,
        password,
        planId,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        return;
      }

      navigate('/conta', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Falha ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsEmailConfirmation) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-teal-700" />
          <h1 className="auth-title text-center">Confirme seu e-mail</h1>
          <p className="auth-lead text-center">
            Enviamos um link para <strong>{email}</strong>. Depois de confirmar,
            entre na conta para começar os 15 dias de teste.
          </p>
          <Link to="/entrar" className="auth-submit mt-6 block text-center">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <p className="auth-brand">QeeL</p>
        <h1 className="auth-title">Comece seu teste grátis</h1>
        <p className="auth-lead">
          15 dias completos · sem cartão de crédito · cancele quando quiser
        </p>

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Nenhum cartão necessário</p>
            <p className="text-teal-800/80">
              Você escolhe o plano agora só para configurar o trial. A cobrança
              só começa depois dos 15 dias, se quiser continuar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="auth-label">Plano do trial</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(PLAN_CATALOG) as PlanId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlanId(id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    planId === id
                      ? 'border-teal-700 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{PLAN_CATALOG[id].name}</p>
                  <p className="text-xs text-slate-500">
                    {formatPrice(PLAN_CATALOG[id].price)}/mês
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{plan.blurb}</p>
          </div>

          <label className="block">
            <span className="auth-label">Seu nome</span>
            <input
              className="auth-input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nome do responsável"
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className="auth-label">Nome do restaurante</span>
            <input
              className="auth-input"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ex: Cantina do Centro"
              required
            />
          </label>

          <label className="block">
            <span className="auth-label">E-mail</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@restaurante.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="auth-label">Telefone (opcional)</span>
            <input
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />
          </label>

          <label className="block">
            <span className="auth-label">Senha</span>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta e iniciar trial'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/entrar" className="font-semibold text-teal-800 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};
