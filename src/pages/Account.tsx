import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Wallet, CreditCard, Users, CreditCard as BankIcon, Gift, DollarSign, LogOut, ChevronRight, Award, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
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
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] pb-20">
      <div className="bg-gradient-to-r from-primary to-accent p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-full" />
            <div>
              <p className="text-white font-semibold">{profile?.full_name}</p>
              <p className="text-white/80 text-sm">ID: {maskMobile(profile?.mobile_number || "")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white" onClick={handleTelegram}>
            <Bell />
          </Button>
        </div>
      </div>

      <div className="p-4 -mt-8">
        <div className="bg-[hsl(var(--navy-medium))] rounded-lg p-4 mb-4 cursor-pointer" onClick={() => navigate("/vip")}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">VIP {currentVIP}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Current progress {totalRecharge.toFixed(2)}/{nextVIPAmount}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <Progress value={vipProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <Button onClick={() => navigate("/recharge")} variant="outline" className="flex flex-col h-20 bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))]">
            <Wallet className="w-5 h-5 mb-1 text-foreground" />
            <span className="text-xs text-foreground">Recharge</span>
          </Button>
          <Button onClick={() => navigate("/withdraw")} variant="outline" className="flex flex-col h-20 bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))]">
            <CreditCard className="w-5 h-5 mb-1 text-foreground" />
            <span className="text-xs text-foreground">Withdraw</span>
          </Button>
          <Button onClick={() => navigate("/my-orders")} variant="outline" className="flex flex-col h-20 bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))]">
            <Gift className="w-5 h-5 mb-1 text-foreground" />
            <span className="text-xs text-foreground">My Orders</span>
          </Button>
          <Button onClick={() => navigate("/bank-card")} variant="outline" className="flex flex-col h-20 bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))]">
            <BankIcon className="w-5 h-5 mb-1 text-foreground" />
            <span className="text-xs text-foreground">Bank Card</span>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">My Business</h3>
        <Button onClick={() => navigate("/team")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <Users className="w-5 h-5 mr-2" /> Team
        </Button>
        <Button onClick={() => navigate("/reward")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <Gift className="w-5 h-5 mr-2" /> Reward
        </Button>

        <h3 className="font-semibold text-sm text-muted-foreground pt-4">Fund Profile</h3>
        <Button onClick={() => navigate("/balance")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <DollarSign className="w-5 h-5 mr-2" /> Balance
        </Button>
        <Button onClick={() => navigate("/recharge-record")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <Wallet className="w-5 h-5 mr-2" /> Recharge Record
        </Button>
        <Button onClick={() => navigate("/withdraw-record")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <CreditCard className="w-5 h-5 mr-2" /> Withdraw Record
        </Button>
        <Button onClick={() => navigate("/vip")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <Award className="w-5 h-5 mr-2" /> VIP
        </Button>
        <Button onClick={handleTelegram} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          Support Center
        </Button>
        <Button onClick={() => navigate("/setting")} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          <Settings className="w-5 h-5 mr-2" /> Setting
        </Button>
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-destructive">
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Account;
