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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] pb-20">
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-6 rounded-b-[3rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={logo} alt="Seedworks" className="w-16 h-16 rounded-2xl shadow-xl animate-glow" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">{profile?.full_name}</p>
              <p className="text-white/90 text-sm">ID: {maskMobile(profile?.mobile_number || "")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:scale-110 transition-all" onClick={handleTelegram}>
            <Bell className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 -mt-12">
        <div className="glass-effect rounded-2xl p-5 mb-4 cursor-pointer transform hover:scale-105 transition-all duration-300 animate-fade-scale" onClick={() => navigate("/vip")}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-glow">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-white text-lg">VIP {currentVIP}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                ₹{totalRecharge.toFixed(2)}/₹{nextVIPAmount}
              </span>
              <ChevronRight className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <Progress value={vipProgress} className="h-3 bg-gray-700" />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <Button onClick={() => navigate("/recharge")} className="flex flex-col h-24 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
            <Wallet className="w-7 h-7 mb-2 text-white" />
            <span className="text-xs text-white font-semibold">Recharge</span>
          </Button>
          <Button onClick={() => navigate("/withdraw")} className="flex flex-col h-24 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-green-500/50">
            <CreditCard className="w-7 h-7 mb-2 text-white" />
            <span className="text-xs text-white font-semibold">Withdraw</span>
          </Button>
          <Button onClick={() => navigate("/my-orders")} className="flex flex-col h-24 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-purple-500/50">
            <Gift className="w-7 h-7 mb-2 text-white" />
            <span className="text-xs text-white font-semibold">Orders</span>
          </Button>
          <Button onClick={() => navigate("/bank-card")} className="flex flex-col h-24 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 border-0 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-500/50">
            <BankIcon className="w-7 h-7 mb-2 text-white" />
            <span className="text-xs text-white font-semibold">Bank</span>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">My Business</h3>
        <Button onClick={() => navigate("/team")} className="w-full justify-start glass-effect border border-purple-500/30 hover:bg-purple-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Users className="w-5 h-5 mr-3" /> <span className="font-semibold">Team</span>
        </Button>
        <Button onClick={() => navigate("/reward")} className="w-full justify-start glass-effect border border-purple-500/30 hover:bg-purple-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Gift className="w-5 h-5 mr-3" /> <span className="font-semibold">Rewards</span>
        </Button>

        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2 pt-4">Financial</h3>
        <Button onClick={() => navigate("/balance")} className="w-full justify-start glass-effect border border-blue-500/30 hover:bg-blue-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <DollarSign className="w-5 h-5 mr-3" /> <span className="font-semibold">Balance</span>
        </Button>
        <Button onClick={() => navigate("/recharge-record")} className="w-full justify-start glass-effect border border-blue-500/30 hover:bg-blue-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Wallet className="w-5 h-5 mr-3" /> <span className="font-semibold">Recharge History</span>
        </Button>
        <Button onClick={() => navigate("/withdraw-record")} className="w-full justify-start glass-effect border border-blue-500/30 hover:bg-blue-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <CreditCard className="w-5 h-5 mr-3" /> <span className="font-semibold">Withdrawal History</span>
        </Button>
        <Button onClick={() => navigate("/vip")} className="w-full justify-start glass-effect border border-yellow-500/30 hover:bg-yellow-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Award className="w-5 h-5 mr-3" /> <span className="font-semibold">VIP Center</span>
        </Button>
        
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2 pt-4">Settings</h3>
        <Button onClick={handleTelegram} className="w-full justify-start glass-effect border border-green-500/30 hover:bg-green-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Bell className="w-5 h-5 mr-3" /> <span className="font-semibold">Support Center</span>
        </Button>
        <Button onClick={() => navigate("/setting")} className="w-full justify-start glass-effect border border-gray-500/30 hover:bg-gray-500/20 text-white transform hover:scale-105 transition-all duration-300 h-14">
          <Settings className="w-5 h-5 mr-3" /> <span className="font-semibold">Account Settings</span>
        </Button>
        <Button onClick={handleLogout} className="w-full justify-start glass-effect border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transform hover:scale-105 transition-all duration-300 h-14">
          <LogOut className="w-5 h-5 mr-3" /> <span className="font-semibold">Logout</span>
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Account;
