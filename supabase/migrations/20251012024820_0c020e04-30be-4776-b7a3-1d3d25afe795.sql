-- Add mobile_number column to bank_cards table
ALTER TABLE public.bank_cards 
ADD COLUMN mobile_number text;

-- Add mobile_number column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN mobile_number text;

-- Add mobile_number column to prizes table
ALTER TABLE public.prizes 
ADD COLUMN mobile_number text;

-- Add mobile_number column to recharge_requests table
ALTER TABLE public.recharge_requests 
ADD COLUMN mobile_number text;

-- Add mobile_number column to support_messages table
ALTER TABLE public.support_messages 
ADD COLUMN mobile_number text;

-- Add mobile_number column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN mobile_number text;

-- Add mobile_number column to user_products table
ALTER TABLE public.user_products 
ADD COLUMN mobile_number text;

-- Populate existing records with mobile numbers from profiles
UPDATE public.bank_cards bc
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE bc.user_id = p.user_id;

UPDATE public.blog_posts bp
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE bp.user_id = p.user_id;

UPDATE public.prizes pr
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE pr.user_id = p.user_id;

UPDATE public.recharge_requests rr
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE rr.user_id = p.user_id;

UPDATE public.support_messages sm
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE sm.user_id = p.user_id;

UPDATE public.transactions t
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE t.user_id = p.user_id;

UPDATE public.user_products up
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE up.user_id = p.user_id;

-- Create function to automatically populate mobile_number on insert for all tables
CREATE OR REPLACE FUNCTION public.set_mobile_number_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT mobile_number INTO NEW.mobile_number
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create triggers for all tables
CREATE TRIGGER set_bank_cards_mobile_number
BEFORE INSERT ON public.bank_cards
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_blog_posts_mobile_number
BEFORE INSERT ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_prizes_mobile_number
BEFORE INSERT ON public.prizes
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_recharge_requests_mobile_number
BEFORE INSERT ON public.recharge_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_support_messages_mobile_number
BEFORE INSERT ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_transactions_mobile_number
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();

CREATE TRIGGER set_user_products_mobile_number
BEFORE INSERT ON public.user_products
FOR EACH ROW
EXECUTE FUNCTION public.set_mobile_number_from_profile();