import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RechargeRequest {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string;
  upi_id: string;
  status: string;
  created_at: string;
  profiles: {
    mobile_number: string;
    full_name: string;
  };
}

const AdminRechargeRecord = () => {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState<RechargeRequest[]>([]);
  const [selectedRecharge, setSelectedRecharge] = useState<RechargeRequest | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Access denied. Admin only.");
        navigate("/");
        return;
      }

      setIsVerifying(false);
      fetchRecharges();
    };

    verifyAdmin();
  }, [navigate]);

  const fetchRecharges = async () => {
    const { data } = await supabase
      .from("recharge_requests")
      .select(`
        *,
        profiles!inner(mobile_number, full_name)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setRecharges(data as any);
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
        <h1 className="text-2xl font-bold">Recharge Records</h1>
      </div>

      <div className="space-y-4">
        {recharges.map((recharge) => (
          <Button
            key={recharge.id}
            onClick={() => setSelectedRecharge(recharge)}
            className="w-full justify-start h-auto p-4"
            variant="outline"
          >
            <div className="text-left w-full">
              <div className="font-semibold">{recharge.profiles.mobile_number}</div>
              <div className="text-sm text-muted-foreground">
                Amount: ₹{recharge.amount} | Status: {recharge.status}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(recharge.created_at).toLocaleString()}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedRecharge} onOpenChange={() => setSelectedRecharge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recharge Details</DialogTitle>
          </DialogHeader>
          {selectedRecharge && (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">User</div>
                <div className="font-semibold">{selectedRecharge.profiles.mobile_number}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <div>{selectedRecharge.profiles.full_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Amount</div>
                <div className="font-semibold">₹{selectedRecharge.amount}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">UTR Number</div>
                <div>{selectedRecharge.utr_number}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">UPI ID</div>
                <div>{selectedRecharge.upi_id}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div>{selectedRecharge.status}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{new Date(selectedRecharge.created_at).toLocaleString()}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRechargeRecord;
