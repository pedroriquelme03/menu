export type PlanId = 'essencial' | 'profissional' | 'completo';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired';

export interface Account {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone?: string;
  email: string;
  planId: PlanId;
  trialStartsAt: Date;
  trialEndsAt: Date;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const PLAN_CATALOG: Record<
  PlanId,
  { name: string; price: number; blurb: string }
> = {
  essencial: {
    name: 'Essencial',
    price: 259,
    blurb: 'Sistema completo sem WhatsApp e sem delivery/iFood',
  },
  profissional: {
    name: 'Profissional',
    price: 329,
    blurb: 'Sistema completo sem WhatsApp',
  },
  completo: {
    name: 'Completo',
    price: 499,
    blurb: 'Sistema completo com delivery e WhatsApp',
  },
};

export function isValidPlanId(value: string | null | undefined): value is PlanId {
  return value === 'essencial' || value === 'profissional' || value === 'completo';
}

export function getTrialDaysLeft(trialEndsAt: Date, now = new Date()): number {
  const ms = trialEndsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(account: Account, now = new Date()): boolean {
  return (
    account.subscriptionStatus === 'trialing' &&
    account.trialEndsAt.getTime() > now.getTime()
  );
}
