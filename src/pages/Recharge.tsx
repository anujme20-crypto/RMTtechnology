import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const Recharge = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const quickAmounts = [390, 4770, 11770, 44770, 55770, 77770];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) setProfile(data);
  };

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) < 390) {
      return;
    }
    if (!paymentMethod) {
      return;
    }

    const depositData = {
      amount: parseFloat(amount),
      paymentMethod,
    };
    
    sessionStorage.setItem("depositData", JSON.stringify(depositData));
    navigate("/deposit");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] p-4">
      <div className="flex items-center gap-3 mb-6 animate-slide-up">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="glass-effect text-white hover:bg-purple-500/20 transform hover:scale-110 transition-all">
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold gradient-text">Recharge</h1>
      </div>

      <div className="mb-6 glass-effect rounded-2xl p-6 border border-purple-500/30 animate-fade-scale">
        <p className="text-sm text-gray-400 mb-2">Current Balance</p>
        <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">₹{profile?.recharge_balance?.toFixed(2)}</p>
      </div>

      <div className="mb-6">
        <Label className="mb-3 block text-white font-semibold text-lg">Quick Amount</Label>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((quickAmount, idx) => (
            <Button
              key={quickAmount}
              variant="outline"
              onClick={() => setAmount(quickAmount.toString())}
              className={`glass-effect border-purple-500/30 text-white hover:bg-purple-500/20 font-bold h-16 transform hover:scale-110 transition-all animate-fade-scale ${
                amount === quickAmount.toString() ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500" : ""
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              ₹{quickAmount}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6 animate-fade-scale" style={{ animationDelay: '0.3s' }}>
        <Label htmlFor="amount" className="text-white font-semibold text-lg mb-3 block">Deposit Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 h-14 text-lg"
        />
      </div>

      <div className="mb-6">
        <Label className="mb-3 block text-white">Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 p-3 border border-[#2d4a6f] rounded-lg mb-2 bg-[#1e3a5f]">
            <RadioGroupItem value="PTM_NEW_PAY" id="ptm" />
            <Label htmlFor="ptm" className="cursor-pointer flex-1 text-white">PTM NEW PAY</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-[#2d4a6f] rounded-lg mb-2 bg-[#1e3a5f]">
            <RadioGroupItem value="UZXUM_PAY" id="uzxum" />
            <Label htmlFor="uzxum" className="cursor-pointer flex-1 text-white">UZXUM PAY</Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-[#2d4a6f] rounded-lg bg-[#1e3a5f]">
            <RadioGroupItem value="QE_PAY" id="qe" />
            <Label htmlFor="qe" className="cursor-pointer flex-1 text-white">QE PAY</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="mb-6 p-4 bg-[#1e3a5f] rounded-lg border border-[#2d4a6f]">
        <h3 className="font-semibold mb-2 text-white">Explanation</h3>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Minimum recharge: ₹390</li>
          <li>• Please select a payment method</li>
          <li>• Complete payment within 10 minutes</li>
        </ul>
      </div>

      <Button
        onClick={handleDeposit}
        disabled={!amount || parseFloat(amount) < 390 || !paymentMethod}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 animate-fade-scale"
        style={{ animationDelay: '0.6s' }}
      >
        Proceed to Payment
      </Button>
    </div>
  );
};

export default Recharge;
