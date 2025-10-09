-- Create admin user role
-- First, ensure we have the admin user's profile
-- We'll use mobile number @#₹₹#@62687337Ayush as the admin identifier

-- Insert admin role for the admin user
-- This will allow the admin to view all user data even when other users are logged out
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE mobile_number = '@#₹₹#@62687337Ayush'
ON CONFLICT (user_id, role) DO NOTHING;