import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      // Check if admin marker exists in localStorage for faster access
      const isAdminStored = localStorage.getItem('isAdmin') === 'true';
      
      if (isAdminStored) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      // Otherwise verify from database using user_roles table
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        localStorage.setItem('isAdmin', 'true');
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    }

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Verifying access...</p>
      </div>
    );
  }

  return allowed ? <>{children}</> : <Navigate to="/" replace />;
}
