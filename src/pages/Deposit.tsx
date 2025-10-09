import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Shield } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

const Deposit = () => {
  const navigate = useNavigate();
  const [depositData, setDepositData] = useState<any>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(true);
  
  const upiIds = [
    "ayusharora1234@axl",
    "garib-on-top@ibl",
    "talaanujm@fam"
  ];
  
  const [selectedUpi] = useState(upiIds[Math.floor(Math.random() * upiIds.length)]);
  const [activeTab, setActiveTab] = useState<"transfer" | "qr">("transfer");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paytm" | "phonepe">("paytm");

  useEffect(() => {
    const data = sessionStorage.getItem("depositData");
    if (!data) {
      navigate("/recharge");
      return;
    }
    setDepositData(JSON.parse(data));

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/recharge");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (utrNumber.length < 12) {
      toast.error("UTR number must be at least 12 characters");
      return;
    }

    setProcessing(true);
    
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if UTR already exists
      const { data: existing } = await supabase
        .from("recharge_requests")
        .select("id")
        .eq("utr_number", utrNumber)
        .maybeSingle();

      if (existing) {
        toast.error("This UTR number has already been used");
        setProcessing(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      await supabase
        .from("profiles")
        .update({
          recharge_balance: (profile?.recharge_balance || 0) + depositData.amount,
          spin_chances: (profile?.spin_chances || 0) + 1
        })
        .eq("user_id", session.user.id);

      await supabase.from("recharge_requests").insert({
        user_id: session.user.id,
        amount: depositData.amount,
        upi_id: selectedUpi,
        utr_number: utrNumber,
      });

      await supabase.from("transactions").insert({
        user_id: session.user.id,
        transaction_type: "recharge",
        amount: depositData.amount,
        balance_type: "recharge",
        utr_number: utrNumber,
        description: "Recharge",
      });

      sessionStorage.removeItem("depositData");
      toast.success("Recharge successful!");
      navigate("/");
    }, 10000);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  if (!depositData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      {/* Red Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 text-center">
        <h1 className="text-lg font-semibold mb-4">PTMPay</h1>
        <p className="text-sm mb-1 opacity-90">Payment Amount</p>
        <p className="text-4xl font-bold mb-4">₹{depositData.amount}</p>
        <p className="text-2xl font-mono">{formatTime(timeLeft)}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-pink-100 border-b border-pink-200">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "transfer"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500"
          }`}
        >
          Direct Transfer
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "qr"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500"
          }`}
        >
          Scan QRCode
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Method Selection */}
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPaymentMethod("paytm")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPaymentMethod === "paytm"
                  ? "border-red-500 bg-white"
                  : "border-pink-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <span className="font-medium text-gray-800">Paytm</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedPaymentMethod("phonepe")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPaymentMethod === "phonepe"
                  ? "border-red-500 bg-white"
                  : "border-pink-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <span className="font-medium text-gray-800">Phonepe</span>
              </div>
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-100 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">
            Payment can only be made once. Multiple payments are not valid!!!
          </p>
        </div>

        {/* Transfer Instructions */}
        <div className="bg-pink-50 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-800 mb-3">
              1. Transfer {depositData.amount} RS to the following upi
            </p>
            
            <div className="space-y-3">
              {/* UPI ID */}
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <span className="text-gray-800 font-medium">{selectedUpi}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedUpi);
                    toast.success("UPI ID copied!");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              {/* Amount */}
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <span className="text-gray-800 font-medium">{depositData.amount} RS</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(depositData.amount.toString());
                    toast.success("Amount copied!");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800 mb-3">
              2. Submit Ref No/Reference No/UTR
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="UTR(UPI Ref.ID)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                minLength={12}
                className="flex-1 bg-white border-pink-200"
              />
              <Button
                onClick={handleSubmit}
                disabled={processing || utrNumber.length < 12}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {processing ? "Processing..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Logos */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-gray-400 font-semibold text-sm">UPI</div>
          <div className="text-gray-400 font-semibold text-sm">BHIM</div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
