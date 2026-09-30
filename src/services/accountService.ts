import { supabase } from '../lib/supabase';
import {
  Account,
  PlanId,
  SubscriptionStatus,
} from '../types/billing';

function mapAccount(row: any): Account {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    ownerName: row.owner_name,
    phone: row.phone || undefined,
    email: row.email,
    planId: row.plan_id,
    trialStartsAt: new Date(row.trial_starts_at),
    trialEndsAt: new Date(row.trial_ends_at),
    subscriptionStatus: row.subscription_status as SubscriptionStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class AccountService {
  static async signUpTrial(input: {
    email: string;
    password: string;
    ownerName: string;
    restaurantName: string;
    phone?: string;
    planId: PlanId;
  }): Promise<{ needsEmailConfirmation: boolean; error?: string }> {
    const email = input.email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          owner_name: input.ownerName.trim(),
          restaurant_name: input.restaurantName.trim(),
          phone: input.phone?.trim() || '',
          plan_id: input.planId,
        },
      },
    });

    if (authError) {
      return { needsEmailConfirmation: false, error: authError.message };
    }

    if (!authData.user) {
      return {
        needsEmailConfirmation: false,
        error: 'Não foi possível criar o usuário.',
      };
    }

    // Conta/trial criada via trigger handle_new_user
    return { needsEmailConfirmation: !authData.session };
  }

  static async signIn(email: string, password: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: error.message };
    return {};
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getCurrentAccount(): Promise<Account | null> {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar conta:', error);
      return null;
    }

    return data ? mapAccount(data) : null;
  }
}
