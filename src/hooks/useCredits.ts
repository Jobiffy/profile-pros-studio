import { useState, useEffect, useCallback, useRef } from "react";
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
  const inFlight = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setBalance(data.balance);
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

  const deductCredits = useCallback(
    async (feature: keyof typeof CREDIT_COSTS, description: string): Promise<boolean> => {
      if (!user) return false;
      if (inFlight.current) return false;
      const cost = CREDIT_COSTS[feature];

      inFlight.current = true;
      try {
        const { data, error } = await supabase.rpc("deduct_credits", {
          p_amount: cost,
          p_feature: feature,
          p_description: description,
        });

        if (error) {
          if (error.message?.includes("insufficient_credits")) {
            toast({
              title: "Insufficient Credits",
              description: `You need ${cost} credits for this action. Please top up.`,
              variant: "destructive",
            });
          } else {
            toast({ title: "Error", description: "Failed to deduct credits.", variant: "destructive" });
          }
          return false;
        }

        setBalance(data ?? null);
        fetchTransactions();
        return true;
      } finally {
        inFlight.current = false;
      }
    },
    [user, fetchTransactions]
  );

  const addCredits = useCallback(
    async (amount: number, description: string): Promise<boolean> => {
      if (!user) return false;
      if (inFlight.current) return false;

      inFlight.current = true;
      try {
        const { data, error } = await supabase.rpc("add_credits", {
          p_amount: amount,
          p_description: description,
        });

        if (error) {
          toast({ title: "Top-up failed", description: error.message, variant: "destructive" });
          return false;
        }

        setBalance(data ?? null);
        fetchTransactions();
        toast({ title: "Credits added", description: `+${amount} credits` });
        return true;
      } finally {
        inFlight.current = false;
      }
    },
    [user, fetchTransactions]
  );

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
