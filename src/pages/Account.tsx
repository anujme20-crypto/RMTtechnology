import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Wallet, CreditCard, Users, CreditCard as BankIcon, Gift, DollarSign, LogOut, ChevronRight, Award, Settings } from "lucide-react";
import logo from "@/assets/seedworks-logo.png";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

const Account = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [totalRecharge, setTotalRecharge] = useState(0);
  const [currentVIP, setCurrentVIP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({
    recharge: 0,
    withdraw: 0,
    income: 0,
    pending: 0
  });

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

    if (data) {
      setProfile(data);
      setBalances({
        recharge: data.recharge_balance || 0,
        withdraw: data.withdrawal_balance || 0,
        income: data.product_income || 0,
        pending: 0
      });
      
      // Calculate total recharge
      const { data: recharges } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", session.user.id)
        .eq("transaction_type", "recharge");

      if (recharges) {
        const total = recharges.reduce((sum, tx) => sum + tx.amount, 0);
        setTotalRecharge(total);
        
        // Determine VIP level
        if (total >= 55770) setCurrentVIP(6);
        else if (total >= 44770) setCurrentVIP(5);
        else if (total >= 22770) setCurrentVIP(4);
        else if (total >= 11770) setCurrentVIP(3);
        else if (total >= 4770) setCurrentVIP(2);
        else if (total >= 390) setCurrentVIP(1);
        else setCurrentVIP(0);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  const maskMobile = (mobile: string) => {
    if (!mobile || mobile.length < 7) return mobile;
    return `${mobile.slice(0, 3)}****${mobile.slice(-3)}`;
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  if (!profile) return null;

  const nextVIPAmount = currentVIP === 6 ? 55770 : [390, 4770, 11770, 22770, 44770, 55770][currentVIP];
  const vipProgress = (totalRecharge / nextVIPAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] pb-20">
      <div className="relative bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] p-6 pb-8">
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-white text-sm">{maskMobile(profile?.mobile_number || "")}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-10 h-10" onClick={handleTelegram}>
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-10 h-10" onClick={() => navigate("/")}>
              <Award className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="text-white font-bold text-2xl">{maskMobile(profile?.mobile_number || "")}</p>
        </div>
      </div>

      <div className="p-4 -mt-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-6 cursor-pointer" onClick={() => navigate("/vip")}>
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-yellow-400" />
            <span className="font-bold text-white text-lg">VIP LEVEL</span>
            <span className="ml-auto bg-white/20 px-4 py-1 rounded-full text-white text-sm font-bold">
              ₹VIP{currentVIP}
            </span>
          </div>
          <Progress value={vipProgress} className="h-2 bg-white/20" />
        </div>

        <div className="bg-white rounded-3xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-medium">Recharge Balance</span>
            <Button onClick={() => navigate("/recharge")} className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-2 rounded-2xl font-semibold">
              Recharge &gt;
            </Button>
          </div>
          <div className="text-3xl font-bold text-gray-800">₹{balances.recharge.toFixed(2)}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button onClick={() => navigate("/withdraw")} className="flex flex-col items-center justify-center h-24 bg-white hover:bg-gray-50 border-0 rounded-2xl shadow-sm">
            <CreditCard className="w-8 h-8 mb-2 text-[#0ea5e9]" />
            <span className="text-sm text-gray-700 font-medium">Withdrawal</span>
            <ChevronRight className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
          </Button>
          <Button onClick={() => navigate("/my-orders")} className="flex flex-col items-center justify-center h-24 bg-white hover:bg-gray-50 border-0 rounded-2xl shadow-sm">
            <Gift className="w-8 h-8 mb-2 text-[#0ea5e9]" />
            <span className="text-sm text-gray-700 font-medium">Orders</span>
            <ChevronRight className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
          </Button>
          <Button onClick={() => navigate("/bank-card")} className="flex flex-col items-center justify-center h-24 bg-white hover:bg-gray-50 border-0 rounded-2xl shadow-sm">
            <BankIcon className="w-8 h-8 mb-2 text-[#0ea5e9]" />
            <span className="text-sm text-gray-700 font-medium">Bank Card</span>
            <ChevronRight className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-sm text-white mb-3">Fund entry</h3>
        <div className="space-y-3">
          <Button onClick={() => navigate("/balance")} className="w-full justify-between bg-white hover:bg-gray-50 text-gray-800 h-16 rounded-2xl px-5 relative">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Funding details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
          <Button onClick={() => navigate("/withdraw-record")} className="w-full justify-between bg-white hover:bg-gray-50 text-gray-800 h-16 rounded-2xl px-5 relative">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Withdrawal account</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Account;
