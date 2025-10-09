-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add encrypted password fields to profiles
ALTER TABLE public.profiles
ADD COLUMN encrypted_password TEXT,
ADD COLUMN encrypted_trade_password TEXT;

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id
);

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id
);

-- Add last_welfare_income_date to profiles
ALTER TABLE public.profiles
ADD COLUMN last_welfare_income_date DATE;

-- Allow admins to view all withdrawal requests
CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawal_requests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id
);

-- Allow admins to update withdrawal requests
CREATE POLICY "Admins can update withdrawals"
ON public.withdrawal_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all recharge requests
CREATE POLICY "Admins can view all recharges"
ON public.recharge_requests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id
);