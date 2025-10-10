import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSystemBonus = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [loading, setLoading] = useState(false);
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
    };

    verifyAdmin();
  }, [navigate]);

  const giveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !bonusAmount) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Get user profile by mobile number
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, withdrawal_balance")
        .eq("mobile_number", mobileNumber)
        .single();

      if (!profile) {
        toast.error("User not found");
        return;
      }

      const amount = parseFloat(bonusAmount);

      // Update user's withdrawal balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          withdrawal_balance: (profile.withdrawal_balance || 0) + amount,
        })
        .eq("user_id", profile.user_id);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: profile.user_id,
        transaction_type: "reward",
        amount: amount,
        balance_type: "withdrawal",
        description: "System Reward",
      });

      toast.success(`₹${amount} bonus given successfully`);
      setMobileNumber("");
      setBonusAmount("");
    } catch (error) {
      toast.error("Failed to give bonus");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold">System Bonus</h1>
      </div>

      <form onSubmit={giveBonus} className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mobile">Please enter number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Please enter rupees</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter bonus amount"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
            required
            min="1"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-accent"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default AdminSystemBonus;
