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

  const updateStatus = async (newStatus: string) => {
    if (!selectedWithdrawal) return;

    const { error } = await supabase
      .from("withdrawal_requests")
      .update({ 
        status: newStatus,
        processed_at: new Date().toISOString()
      })
      .eq("id", selectedWithdrawal.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    // If Success, deduct from withdrawal balance and create transaction record
    if (newStatus === "Success") {
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

        // Create transaction record for approved withdrawal
        await supabase.from("transactions").insert({
          user_id: selectedWithdrawal.user_id,
          transaction_type: "withdrawal",
          amount: -selectedWithdrawal.amount,
          balance_type: "withdrawal",
          description: "Withdraw approved by admin",
          status: "completed"
        });
      }
    }

    toast.success(`Status updated to ${newStatus}`);
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

      <div className="space-y-3">
        {withdrawals.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="bg-card border-2 border-border rounded-xl p-5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              background: 'linear-gradient(135deg, hsl(210, 35%, 20%), hsl(210, 40%, 16%))',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.05)'
            }}
          >
            <div 
              className="cursor-pointer"
              onClick={() => setSelectedWithdrawal(selectedWithdrawal?.id === withdrawal.id ? null : withdrawal)}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-lg text-primary" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {withdrawal.profiles.mobile_number}
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${
                  withdrawal.status === "Under Review" ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50" :
                  withdrawal.status === "Processing" ? "bg-blue-500/20 text-blue-400 border-2 border-blue-500/50" :
                  withdrawal.status === "Success" ? "bg-green-500/20 text-green-400 border-2 border-green-500/50" :
                  "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                }`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {withdrawal.status}
                </div>
              </div>
              <div className="text-foreground font-semibold text-xl mb-2">
                ₹{withdrawal.final_amount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(withdrawal.created_at).toLocaleString()}
              </div>
            </div>
            
            {selectedWithdrawal?.id === withdrawal.id && (
              <div className="mt-4 pt-4 border-t-2 border-border/50 flex gap-3">
                {withdrawal.status === "Under Review" && (
                  <Button
                    onClick={() => updateStatus("Processing")}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold border-2 border-yellow-400/50 shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.6)] transition-all duration-300"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    Under Review → Processing
                  </Button>
                )}
                {withdrawal.status === "Processing" && (
                  <Button
                    onClick={() => updateStatus("Success")}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold border-2 border-green-400/50 shadow-[0_4px_12px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_16px_rgba(34,197,94,0.6)] transition-all duration-300"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    Processing → Success
                  </Button>
                )}
                <Button
                  onClick={() => setShowBankDetails(true)}
                  variant="outline"
                  className="flex-1 border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-bold shadow-[0_4px_12px_rgba(43,100,62,0.3)] transition-all duration-300"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  Bank Details
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>


      <Dialog open={showBankDetails} onOpenChange={() => setShowBankDetails(false)}>
        <DialogContent className="border-2 border-border" style={{ 
          background: 'linear-gradient(135deg, hsl(210, 35%, 20%), hsl(210, 40%, 16%))',
          boxShadow: '0 12px 32px rgba(0,0,0,0.7)'
        }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Bank Card Details
            </DialogTitle>
          </DialogHeader>
          {selectedWithdrawal?.bank_cards && selectedWithdrawal.bank_cards.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border-2 border-border/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">Bank Name</div>
                <div className="text-lg font-bold text-foreground">{selectedWithdrawal.bank_cards[0].bank_name}</div>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border-2 border-border/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">Account Number</div>
                <div className="text-lg font-bold text-foreground">{selectedWithdrawal.bank_cards[0].account_number}</div>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border-2 border-border/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">Card Holder Name</div>
                <div className="text-lg font-bold text-foreground">{selectedWithdrawal.bank_cards[0].card_holder_name}</div>
              </div>
              <div className="bg-background/50 p-4 rounded-lg border-2 border-border/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">IFSC Code</div>
                <div className="text-lg font-bold text-foreground">{selectedWithdrawal.bank_cards[0].ifsc_code}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground font-medium">No bank details available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawOrders;
