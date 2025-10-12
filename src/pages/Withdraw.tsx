import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Withdraw = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bankCard, setBankCard] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [tradePassword, setTradePassword] = useState("");
  const [showBankCardAlert, setShowBankCardAlert] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    const { data: bankData } = await supabase
      .from("bank_cards")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);
    if (bankData) {
      setBankCard(bankData);
    } else {
      setShowBankCardAlert(true);
    }
  };

  const handleWithdraw = async () => {
    if (!profile || !bankCard) return;

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount < 106) {
      toast.error("Minimum withdraw ₹106");
      return;
    }

    if (withdrawAmount > profile.withdrawal_balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (tradePassword !== profile.trade_password) {
      toast.error("Invalid trade password");
      return;
    }

    // Check if user already withdrew today
    const today = new Date().toISOString().split('T')[0];
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: existingWithdraw } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    if (existingWithdraw && existingWithdraw.length > 0) {
      toast.error("You can withdraw only once per day!");
      return;
    }

    const taxAmount = withdrawAmount * 0.05;
    const finalAmount = withdrawAmount - taxAmount;

    // Deduct from withdrawal balance
    await supabase
      .from("profiles")
      .update({ 
        withdrawal_balance: profile.withdrawal_balance - withdrawAmount 
      })
      .eq("user_id", session.user.id);

    await supabase.from("withdrawal_requests").insert({
      user_id: session.user.id,
      amount: withdrawAmount,
      final_amount: finalAmount,
      tax_amount: taxAmount,
      status: "Under Review",
    });

    await supabase.from("transactions").insert({
      user_id: session.user.id,
      transaction_type: "withdraw",
      amount: withdrawAmount,
      balance_type: "withdrawal",
      status: "pending",
      description: "Withdrawal request",
    });

    toast.success("Withdrawal request submitted successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <AlertDialog open={showBankCardAlert} onOpenChange={setShowBankCardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>System Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              You have not linked your Bank card. Please link your bank card first
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/bank-card")}>
              Link Bank Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Withdraw</h1>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Amount Balance</p>
          <p className="text-3xl font-bold text-primary">₹{profile?.withdrawal_balance?.toFixed(2)}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/withdraw-record")}>
          Withdrawal History
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="amount">Withdraw Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Withdraw amount 106 - 100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="tradePassword">Transaction Password</Label>
          <Input
            id="tradePassword"
            type="password"
            placeholder="Enter transaction password"
            value={tradePassword}
            onChange={(e) => setTradePassword(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Banking Card</Label>
          {bankCard ? (
            <div className="mt-2 p-4 bg-card rounded-lg border border-border">
              <p className="text-sm"><span className="text-muted-foreground">Name:</span> {bankCard.card_holder_name}</p>
              <p className="text-sm"><span className="text-muted-foreground">Account:</span> {bankCard.account_number}</p>
              <p className="text-sm"><span className="text-muted-foreground">IFSC:</span> {bankCard.ifsc_code}</p>
            </div>
          ) : (
            <Button onClick={() => navigate("/bank-card")} variant="outline" className="w-full mt-2">
              Select Bank Card
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={handleWithdraw}
        disabled={!bankCard || !amount || !tradePassword}
        className="w-full bg-gradient-to-r from-primary to-accent mb-6"
      >
        Request Withdrawal
      </Button>

      <div className="p-4 bg-card rounded-lg border border-border text-sm text-muted-foreground">
        <p className="mb-2"><strong>Withdrawal Tax Rate: 5%</strong></p>
        <p className="mb-1">• Minimum withdrawal: ₹106</p>
        <p className="mb-1">• Maximum withdrawal: ₹100,000</p>
        <p>• Processing time: 24-48 hours</p>
      </div>
    </div>
  );
};

export default Withdraw;
