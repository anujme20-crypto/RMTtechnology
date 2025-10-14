-- Allow users to view profiles of people they invited
CREATE POLICY "Users can view their referrals"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE invite_code = profiles.invited_by
  )
);