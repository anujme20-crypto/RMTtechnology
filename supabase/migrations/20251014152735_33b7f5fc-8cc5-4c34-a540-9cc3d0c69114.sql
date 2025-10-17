-- Remove password fields from profiles table as they should not be stored in database
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS encrypted_password,
DROP COLUMN IF EXISTS encrypted_trade_password,
DROP COLUMN IF EXISTS trade_password;

-- Create function to add daily earnings for active stable products
CREATE OR REPLACE FUNCTION public.process_daily_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add daily earnings to product_income for users with active stable products
  UPDATE public.profiles p
  SET product_income = COALESCE(product_income, 0) + daily_total.total_earnings
  FROM (
    SELECT 
      up.user_id,
      SUM(pr.daily_earnings) as total_earnings
    FROM public.user_products up
    JOIN public.products pr ON up.product_id = pr.id
    WHERE up.is_active = true
      AND pr.product_type = 'stable'
      AND up.days_remaining > 0
    GROUP BY up.user_id
  ) daily_total
  WHERE p.user_id = daily_total.user_id;
  
  -- Decrease days_remaining for active products
  UPDATE public.user_products
  SET days_remaining = days_remaining - 1,
      is_active = CASE WHEN days_remaining - 1 <= 0 THEN false ELSE is_active END
  WHERE is_active = true
    AND days_remaining > 0;
END;
$$;