import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: "topup" | "deduction" | "bonus";
  description: string | null;
  feature: string | null;
  created_at: string;
}

const CREDIT_COSTS = {
  ai_chat: 2,
  jd_match: 3,
  ats_check: 3,
} as const;

export function useCredits() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setBalance(data.balance);
    } else {
      // Initialize credits for existing users
      await supabase.from("user_credits").insert({ user_id: user.id, balance: 50 });
      await supabase.from("credit_transactions").insert({
        user_id: user.id, amount: 50, type: "bonus",
        description: "Welcome bonus credits", feature: "signup_bonus",
      });
      setBalance(50);
    }
    setLoading(false);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTransactions(data as CreditTransaction[]);
  }, [user]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  const deductCredits = useCallback(async (feature: keyof typeof CREDIT_COSTS, description: string): Promise<boolean> => {
    if (!user || balance === null) return false;
    const cost = CREDIT_COSTS[feature];
    if (balance < cost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${cost} credits for this action. Current balance: ${balance}. Please top up!`,
        variant: "destructive",
      });
      return false;
    }

    const newBalance = balance - cost;
    const { error } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to deduct credits", variant: "destructive" });
      return false;
    }

    await supabase.from("credit_transactions").insert({
      user_id: user.id, amount: -cost, type: "deduction",
      description, feature,
    });

    setBalance(newBalance);
    fetchTransactions();
    return true;
  }, [user, balance, fetchTransactions]);

  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!user || balance === null) return false;
    const newBalance = balance + amount;
    const { error } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (error) return false;

    await supabase.from("credit_transactions").insert({
      user_id: user.id, amount, type: "topup",
      description, feature: "topup",
    });

    setBalance(newBalance);
    fetchTransactions();
    toast({ title: "Credits Added!", description: `+${amount} credits added to your account.` });
    return true;
  }, [user, balance, fetchTransactions]);

  return {
    balance,
    transactions,
    loading,
    deductCredits,
    addCredits,
    fetchBalance,
    fetchTransactions,
    CREDIT_COSTS,
  };
}
