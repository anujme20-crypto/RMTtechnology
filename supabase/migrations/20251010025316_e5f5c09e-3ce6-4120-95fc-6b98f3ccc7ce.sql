-- Drop the existing INSERT policy for admins if it exists
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;

-- Create a new policy that allows admins to insert roles using the has_role function
CREATE POLICY "Admins can insert roles"
ON user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Also create a policy to allow service role to insert (for initial setup)
CREATE POLICY "Service role can insert roles"
ON user_roles
FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');