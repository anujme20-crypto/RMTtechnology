import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useSessionPersistence = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session has expired (30 day check)
    const checkSessionExpiry = () => {
      const expiryDate = localStorage.getItem('sessionExpiry');
      if (expiryDate) {
        const expiry = new Date(expiryDate);
        const now = new Date();
        
        if (now > expiry) {
          // Session expired, clear and logout
          localStorage.removeItem('sessionExpiry');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('rememberedUser');
          supabase.auth.signOut();
          navigate('/login');
        }
      }
    };

    // Check on mount
    checkSessionExpiry();

    // Check every 5 minutes
    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);
};
