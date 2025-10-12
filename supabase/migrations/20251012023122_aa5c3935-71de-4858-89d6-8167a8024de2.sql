-- Add mobile_number column to withdrawal_requests table
ALTER TABLE public.withdrawal_requests 
ADD COLUMN mobile_number text;

-- Populate existing records with mobile numbers from profiles
UPDATE public.withdrawal_requests wr
SET mobile_number = p.mobile_number
FROM public.profiles p
WHERE wr.user_id = p.user_id;

-- Create function to automatically populate mobile_number on insert
CREATE OR REPLACE FUNCTION public.set_withdrawal_mobile_number()
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

-- Create trigger to auto-populate mobile_number
CREATE TRIGGER set_withdrawal_mobile_number_trigger
BEFORE INSERT ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_withdrawal_mobile_number();