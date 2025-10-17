-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view their referrals" ON public.profiles;

-- Create a security definer function to check if a profile can be viewed
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_user_id uuid, _profile_invited_by text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND (_profile_user_id = auth.uid() OR invite_code = _profile_invited_by)
  )
$$;

-- Create new policy using the security definer function
CREATE POLICY "Users can view own profile and referrals"
ON public.profiles
FOR SELECT
USING (public.can_view_profile(user_id, invited_by));