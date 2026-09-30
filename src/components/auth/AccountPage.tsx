import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  PLAN_CATALOG,
  getTrialDaysLeft,
  isTrialActive,
} from '../../types/billing';
import { CalendarDays, LogOut, Store } from 'lucide-react';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export const AccountPage: React.FC = () => {
  const { account, isLoading, user, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-card text-center text-slate-500">Carregando conta...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (!account) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">Conta em preparação</h1>
          <p className="auth-lead">
            Seu usuário existe, mas o perfil do restaurante ainda não apareceu.
            Atualize a página em alguns segundos.
          </p>
          <button type="button" className="auth-submit" onClick={() => window.location.reload()}>
            Atualizar
          </button>
        </div>
      </div>
    );
  }

  const plan = PLAN_CATALOG[account.planId];
  const daysLeft = getTrialDaysLeft(account.trialEndsAt);
  const trialOk = isTrialActive(account);

  return (
    <div className="auth-shell">
      <div className="auth-card max-w-xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="auth-brand">QeeL</p>
            <h1 className="auth-title">Olá, {account.ownerName.split(' ')[0]}</h1>
            <p className="auth-lead mb-0">{account.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        <div
          className={`mb-4 rounded-2xl border px-4 py-4 ${
            trialOk
              ? 'border-teal-200 bg-teal-50 text-teal-950'
              : 'border-amber-200 bg-amber-50 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <CalendarDays className="h-5 w-5" />
            {trialOk
              ? `Trial ativo · ${daysLeft} dia${daysLeft === 1 ? '' : 's'} restantes`
              : 'Trial encerrado'}
          </div>
          <p className="mt-1 text-sm opacity-80">
            {trialOk
              ? `Válido até ${formatDate(account.trialEndsAt)}. Sem cartão cadastrado.`
              : `Expirou em ${formatDate(account.trialEndsAt)}. Escolha um plano para continuar.`}
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <Store className="mt-0.5 h-5 w-5 text-teal-700" />
            <div>
              <p className="font-bold text-slate-900">{account.restaurantName}</p>
              <p className="text-sm text-slate-500">
                Plano {plan.name} · {formatPrice(plan.price)}/mês após o trial
              </p>
              <p className="mt-1 text-sm text-slate-500">{plan.blurb}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link to="/admin" className="auth-submit text-center">
            Abrir admin
          </Link>
          <Link
            to="/salao"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Ver salão
          </Link>
        </div>
      </div>
    </div>
  );
};
