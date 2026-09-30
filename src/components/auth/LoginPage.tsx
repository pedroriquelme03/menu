import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccountService } from '../../services/accountService';
import { ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await AccountService.signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      navigate('/conta', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Falha ao entrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <p className="auth-brand">QeeL</p>
        <h1 className="auth-title">Entrar na conta</h1>
        <p className="auth-lead">Acesse seu trial ou assinatura ativa.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="auth-label">E-mail</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="auth-label">Senha</span>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-teal-800 hover:underline">
            Começar trial grátis
          </Link>
        </p>
      </div>
    </div>
  );
};
