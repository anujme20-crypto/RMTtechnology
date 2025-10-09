import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  final_amount: number;
  tax_amount: number;
  status: string;
  created_at: string;
  profiles: {
    mobile_number: string;
    full_name: string;
  };
  bank_cards?: {
    bank_name: string;
    account_number: string;
    card_holder_name: string;
    ifsc_code: string;
  }[];
}

const AdminWithdrawOrders = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
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
      fetchWithdrawals();
    };

    verifyAdmin();
  }, [navigate]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from("withdrawal_requests")
      .select(`
        *,
        profiles!inner(mobile_number, full_name),
        bank_cards(bank_name, account_number, card_holder_name, ifsc_code)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setWithdrawals(data as any);
  };

  const updateStatus = async (status: "processing" | "completed" | "rejected") => {
    if (!selectedWithdrawal) return;

    const { error } = await supabase
      .from("withdrawal_requests")
      .update({ 
        status,
        processed_at: new Date().toISOString()
      })
      .eq("id", selectedWithdrawal.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    // If completed, deduct from withdrawal balance
    if (status === "completed") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("withdrawal_balance")
        .eq("user_id", selectedWithdrawal.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            withdrawal_balance: profile.withdrawal_balance - selectedWithdrawal.amount
          })
          .eq("user_id", selectedWithdrawal.user_id);
      }
    }

    // If rejected, return funds to withdrawal balance
    if (status === "rejected") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("withdrawal_balance")
        .eq("user_id", selectedWithdrawal.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            withdrawal_balance: profile.withdrawal_balance + selectedWithdrawal.amount
          })
          .eq("user_id", selectedWithdrawal.user_id);
      }
    }

    toast.success(`Status updated to ${status}`);
    setSelectedWithdrawal(null);
    fetchWithdrawals();
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
        <h1 className="text-2xl font-bold">Withdraw Orders</h1>
      </div>

      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <Button
            key={withdrawal.id}
            onClick={() => setSelectedWithdrawal(withdrawal)}
            className="w-full justify-start h-auto p-4"
            variant="outline"
          >
            <div className="text-left w-full">
              <div className="font-semibold">{withdrawal.profiles.mobile_number}</div>
              <div className="text-sm text-muted-foreground">
                Amount: ₹{withdrawal.final_amount} | Status: {withdrawal.status}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(withdrawal.created_at).toLocaleString()}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedWithdrawal && !showBankDetails} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">User</div>
                <div>{selectedWithdrawal.profiles.mobile_number}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Amount</div>
                <div>₹{selectedWithdrawal.final_amount}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Status</div>
                <div>{selectedWithdrawal.status}</div>
              </div>
              <div className="flex gap-2 mb-2">
                <Button
                  onClick={() => updateStatus("processing")}
                  variant="outline"
                  className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600"
                >
                  Processing
                </Button>
                <Button
                  onClick={() => updateStatus("completed")}
                  variant="outline"
                  className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-600"
                >
                  Success
                </Button>
                <Button
                  onClick={() => updateStatus("rejected")}
                  variant="outline"
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600"
                >
                  Reject
                </Button>
              </div>
              <Button 
                onClick={() => setShowBankDetails(true)} 
                variant="secondary" 
                className="w-full"
              >
                Bank Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBankDetails} onOpenChange={() => setShowBankDetails(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Card Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal?.bank_cards && selectedWithdrawal.bank_cards.length > 0 ? (
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">Bank Name</div>
                <div>{selectedWithdrawal.bank_cards[0].bank_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Account Number</div>
                <div>{selectedWithdrawal.bank_cards[0].account_number}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Card Holder Name</div>
                <div>{selectedWithdrawal.bank_cards[0].card_holder_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium">IFSC Code</div>
                <div>{selectedWithdrawal.bank_cards[0].ifsc_code}</div>
              </div>
            </div>
          ) : (
            <div>No bank details available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawOrders;
