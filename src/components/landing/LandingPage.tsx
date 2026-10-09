import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { PlanId } from '../../types/billing';

const PLANS: {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  featured?: boolean;
  includes: string[];
  excludes: string[];
}[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 259,
    blurb: 'Operação completa no salão, sem canais de delivery.',
    includes: [
      'Cardápio digital via QR Code',
      'Pedidos na mesa',
      'KDS e Painel TV',
      'Caixa, garçom e recepção',
      'Reservas e mapa do salão',
      'Admin e cadastro de mesas',
    ],
    excludes: ['Integração WhatsApp', 'Módulo Delivery / iFood'],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 329,
    blurb: 'Tudo do Essencial + delivery próprio no estilo iFood.',
    featured: true,
    includes: [
      'Tudo do plano Essencial',
      'Delivery com cardápio por categorias',
      'Sacola, pagamento e rastreio',
      'Pedidos no Painel e KDS',
    ],
    excludes: ['Integração WhatsApp'],
  },
  {
    id: 'completo',
    name: 'Completo',
    price: 499,
    blurb: 'Sistema inteiro: salão, delivery e WhatsApp.',
    includes: [
      'Tudo do plano Profissional',
      'Integração WhatsApp',
      'Pedidos WhatsApp no KDS e Painel',
      'Fluxo unificado de canais',
    ],
    excludes: [],
  },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const LandingPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('profissional');

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-root">
      {/* Hero — one composition */}
      <section className="landing-hero">
        <div
          className={`landing-hero-media ${ready ? 'is-ready' : ''}`}
          aria-hidden="true"
        >
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2400&q=80"
            alt=""
          />
          <div className="landing-hero-veil" />
        </div>

        <div className={`landing-hero-content ${ready ? 'is-ready' : ''}`}>
          <p className="landing-brand">QeeL</p>
          <h1 className="landing-headline">
            Pedidos, salão e delivery em um só sistema
          </h1>
          <p className="landing-support">
            Do QR Code na mesa ao painel da cozinha — operação clara para o
            restaurante crescer sem bagunça.
          </p>
          <div className="landing-cta-group">
            <button type="button" className="landing-btn-primary" onClick={scrollToPlans}>
              Ver planos
            </button>
            <Link to="/cadastro?plano=profissional" className="landing-btn-ghost">
              Teste grátis 15 dias
            </Link>
          </div>
        </div>
      </section>

      {/* O sistema */}
      <section className="landing-section landing-about">
        <div className="landing-wrap">
          <p className="landing-eyebrow">O sistema</p>
          <h2 className="landing-section-title">
            Feito para a operação real do restaurante
          </h2>
          <p className="landing-section-text">
            Cliente pede pelo celular, cozinha vê no KDS, salão acompanha no
            painel, caixa fecha a conta. Reservas, recepção, garçom e delivery
            entram no mesmo fluxo — você escolhe o que ativa no plano.
          </p>

          <div className="landing-feature-row">
            {[
              { title: 'Salão', text: 'QR, mesas, garçom, reservas e mapa' },
              { title: 'Cozinha', text: 'KDS unificado e painel para TV' },
              { title: 'Delivery', text: 'Cardápio, pagamento e rastreio' },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`landing-feature ${ready ? 'is-ready' : ''}`}
                style={{ transitionDelay: `${180 + index * 90}ms` }}
              >
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos — cards for interaction */}
      <section id="planos" className="landing-section landing-plans">
        <div className="landing-wrap">
          <p className="landing-eyebrow">Planos</p>
          <h2 className="landing-section-title">Escolha o que o seu salão precisa</h2>
          <p className="landing-section-text">
            Mensalidade simples. Comece no essencial e evolua quando o delivery
            e o WhatsApp fizerem sentido.
          </p>

          <div className="landing-plan-grid">
            {PLANS.map((plan) => {
              const selected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`landing-plan-card ${plan.featured ? 'is-featured' : ''} ${
                    selected ? 'is-selected' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.featured && (
                    <span className="landing-plan-badge">Mais escolhido</span>
                  )}
                  <h3 className="landing-plan-name">{plan.name}</h3>
                  <p className="landing-plan-blurb">{plan.blurb}</p>
                  <p className="landing-plan-price">
                    {formatPrice(plan.price)}
                    <span>/mês</span>
                  </p>

                  <ul className="landing-plan-list">
                    {plan.includes.map((item) => (
                      <li key={item}>
                        <Check className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                    {plan.excludes.map((item) => (
                      <li key={item} className="is-excluded">
                        <X className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <span className="landing-plan-cta">
                    {selected ? 'Plano selecionado' : 'Escolher este plano'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="landing-plan-next">
            <div>
              <p>
                Plano selecionado:{' '}
                <strong>{PLANS.find((p) => p.id === selectedPlan)?.name}</strong>
                {' · '}
                {formatPrice(PLANS.find((p) => p.id === selectedPlan)?.price || 0)}
                /mês
              </p>
              <p className="mt-1 text-sm text-slate-500">
                15 dias grátis · sem cartão de crédito
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/cadastro?plano=${selectedPlan}`}
                className="landing-btn-primary"
              >
                Começar teste grátis
              </Link>
              <Link to="/entrar" className="landing-btn-secondary">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <p className="landing-brand landing-brand-sm">QeeL</p>
          <div className="landing-footer-links">
            <Link to="/cardapio">Cardápio</Link>
            <Link to="/cadastro">Teste grátis</Link>
            <Link to="/entrar">Entrar</Link>
            <Link to="/salao">Salão</Link>
            <Link to="/delivery">Delivery</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
