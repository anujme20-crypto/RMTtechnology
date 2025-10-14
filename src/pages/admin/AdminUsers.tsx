import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  mobile_number: string;
  full_name: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      // Always verify from database - never trust client-side storage
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsVerifying(false);
        fetchProfiles();
      } else {
        toast.error("Access denied. Admin only.");
        navigate("/");
      }
    };

    verifyAdmin();
  }, [navigate]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setProfiles(data);
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="w-full justify-start h-auto p-4"
            variant="outline"
          >
            <div className="text-left">
              <div className="font-semibold">{profile.mobile_number}</div>
              <div className="text-sm text-muted-foreground">{profile.full_name}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* User Details Dialog - Password viewing removed for security */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View user information (password viewing removed for security)</DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Mobile Number</div>
                <div>{selectedProfile.mobile_number}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Name</div>
                <div>{selectedProfile.full_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">User ID</div>
                <div className="font-mono text-xs break-all">{selectedProfile.user_id}</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  🔒 Security Update
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  Password viewing has been removed for security. For password-related issues, please implement a password reset feature.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
