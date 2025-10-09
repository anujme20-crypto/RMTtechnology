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
  trade_password: string;
  encrypted_password: string;
  encrypted_trade_password: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newTradePassword, setNewTradePassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      // Check localStorage admin marker first (faster check)
      const isAdminStored = localStorage.getItem('isAdmin') === 'true';
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      // If admin marker exists, skip database check for faster access
      if (isAdminStored) {
        setIsVerifying(false);
        fetchProfiles();
        return;
      }

      // Otherwise verify from database
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        localStorage.setItem('isAdmin', 'true');
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

  const verifyAdminPassword = () => {
    if (adminPassword === "@#₹62687337@#₹") {
      setIsPasswordVerified(true);
      setShowAdminPassword(false);
    } else {
      toast.error("Wrong admin password");
    }
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsPasswordVerified(false);
    setShowAdminPassword(true);
    setAdminPassword("");
  };

  const decryptPassword = (encrypted: string) => {
    try {
      return atob(encrypted);
    } catch {
      return encrypted;
    }
  };

  const updateCredentials = async () => {
    if (!selectedProfile) return;

    if (newTradePassword) {
      const { error } = await supabase
        .from("profiles")
        .update({ trade_password: newTradePassword })
        .eq("user_id", selectedProfile.user_id);

      if (error) {
        toast.error("Failed to update trade password");
        return;
      }
    }

    toast.success("Credentials updated successfully");
    setSelectedProfile(null);
    setNewPassword("");
    setNewTradePassword("");
    fetchProfiles();
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

      {/* Admin Password Dialog */}
      <Dialog open={showAdminPassword} onOpenChange={setShowAdminPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Verification</DialogTitle>
            <DialogDescription>Enter admin password to view user data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Password</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
                <Button onClick={verifyAdminPassword}>Verify</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Data Dialog */}
      <Dialog open={!!selectedProfile && isPasswordVerified} onOpenChange={() => {
        setSelectedProfile(null);
        setIsPasswordVerified(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and edit user credentials</DialogDescription>
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
                <div className="text-sm font-medium mb-1">Login Password (Plain Text)</div>
                <div className="font-mono bg-muted p-2 rounded">
                  {selectedProfile.encrypted_password ? decryptPassword(selectedProfile.encrypted_password) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Trade Password (Plain Text)</div>
                <div className="font-mono bg-muted p-2 rounded">
                  {selectedProfile.encrypted_trade_password ? decryptPassword(selectedProfile.encrypted_trade_password) : selectedProfile.trade_password}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">New Trade Password</label>
                <Input
                  value={newTradePassword}
                  onChange={(e) => setNewTradePassword(e.target.value)}
                  placeholder="Enter new trade password"
                />
              </div>
              <Button onClick={updateCredentials} className="w-full">
                Update Credentials
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
