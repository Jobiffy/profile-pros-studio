-- Atomic credit operations.
-- The previous client-side pattern read balance into React state, computed
-- newBalance = balance - cost, then UPDATE'd. Two concurrent calls (double
-- click, two tabs, two devices) both read the same starting balance and
-- both wrote the same newBalance, effectively only deducting once. These
-- RPCs run a single UPDATE … WHERE balance >= amount in the database, so
-- the decrement is atomic and over-spending is impossible.

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_amount integer,
  p_feature text,
  p_description text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount' USING ERRCODE = '22023';
  END IF;

  UPDATE public.user_credits
    SET balance = balance - p_amount
    WHERE user_id = v_uid
      AND balance >= p_amount
    RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, feature)
  VALUES (v_uid, -p_amount, 'deduction', p_description, p_feature);

  RETURN v_new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(
  p_amount integer,
  p_description text,
  p_feature text DEFAULT 'topup'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid amount' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_credits (user_id, balance)
  VALUES (v_uid, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.user_credits.balance + EXCLUDED.balance
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, feature)
  VALUES (v_uid, p_amount, 'topup', p_description, p_feature);

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_credits(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(integer, text, text) TO authenticated;
