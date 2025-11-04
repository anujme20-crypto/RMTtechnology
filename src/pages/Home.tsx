import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/seedworks-logo.png";
import { Bell, Wallet, CreditCard, Users, Send, Home as HomeIcon, TrendingUp, FileText, BookOpen, User, Gift, Sparkles } from "lucide-react";
import { WelcomePopup } from "@/components/WelcomePopup";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [teamStats, setTeamStats] = useState({ level1: 0, level1Active: 0, level2: 0, level2Active: 0 });

  useEffect(() => {
    checkAuth();
    const timer = setTimeout(() => setShowWelcomePopup(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
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
      await loadTeamStats(data.invite_code);
    }
    setLoading(false);
  };

  const loadTeamStats = async (inviteCode: string) => {
    // Get level 1 referrals (direct invites)
    const { data: level1 } = await supabase
      .from("profiles")
      .select("user_id, invite_code")
      .eq("invited_by", inviteCode);

    const level1Count = level1?.length || 0;

    // Get level 1 active users (those who purchased stable products)
    let level1Active = 0;
    if (level1 && level1.length > 0) {
      const { data: stableProducts } = await supabase
        .from("user_products")
        .select("user_id, product_id")
        .in("user_id", level1.map(u => u.user_id))
        .eq("is_active", true);
      
      if (stableProducts && stableProducts.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id")
          .eq("product_type", "stable")
          .in("id", stableProducts.map(p => p.product_id));
        
        const stableProductIds = new Set(products?.map(p => p.id));
        const activeUserIds = stableProducts
          .filter(sp => stableProductIds.has(sp.product_id))
          .map(sp => sp.user_id);
        level1Active = new Set(activeUserIds).size;
      }
    }

    // Get level 2 referrals (invites of level 1)
    let level2Count = 0;
    let level2Active = 0;
    if (level1 && level1.length > 0) {
      const level1Codes = level1.map(u => u.invite_code);
      const { data: level2 } = await supabase
        .from("profiles")
        .select("user_id")
        .in("invited_by", level1Codes);

      level2Count = level2?.length || 0;

      // Get level 2 active users (those who purchased stable products)
      if (level2 && level2.length > 0) {
        const { data: stableProducts } = await supabase
          .from("user_products")
          .select("user_id, product_id")
          .in("user_id", level2.map(u => u.user_id))
          .eq("is_active", true);
        
        if (stableProducts && stableProducts.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("id")
            .eq("product_type", "stable")
            .in("id", stableProducts.map(p => p.product_id));
          
          const stableProductIds = new Set(products?.map(p => p.id));
          const activeUserIds = stableProducts
            .filter(sp => stableProductIds.has(sp.product_id))
            .map(sp => sp.user_id);
          level2Active = new Set(activeUserIds).size;
        }
      }
    }

    setTeamStats({ level1: level1Count, level1Active, level2: level2Count, level2Active });
  };

  const handleCheckin = async () => {
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    if (profile.last_checkin_date === today) {
      toast.error("You have already checked in today");
      return;
    }

    // Get user's highest VIP product
    const { data: userProducts } = await supabase
      .from("user_products")
      .select("*, products(*)")
      .eq("user_id", profile.user_id)
      .eq("is_active", true);

    if (!userProducts || userProducts.length === 0) {
      toast.error("Please purchase a product first");
      return;
    }

    const highestVip = Math.max(...userProducts.map((p: any) => p.products.vip_level));
    const reward = highestVip === 1 ? 9 : highestVip === 2 ? 19 : 0;

    await supabase
      .from("profiles")
      .update({ 
        last_checkin_date: today,
        recharge_balance: profile.recharge_balance + reward
      })
      .eq("user_id", profile.user_id);

    await supabase.from("transactions").insert({
      user_id: profile.user_id,
      transaction_type: "checkin",
      amount: reward,
      balance_type: "recharge",
      description: "Daily check-in reward",
    });

    toast.success(`Check-in successful! +₹${reward}`);
    checkAuth();
  };

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-6 rounded-b-[3rem] animate-shimmer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative flex items-center gap-4 mb-4">
          <div className="relative animate-float">
            <img src={logo} alt="Seedworks" className="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-xl" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-xl flex items-center gap-2">
              {profile?.full_name}
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="text-white/90 text-sm font-medium">ID: {profile?.mobile_number}</div>
          </div>
          <button onClick={handleTelegram} className="text-white/80 hover:text-white transition-all transform hover:scale-110 relative">
            <Bell className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
        
        {/* Seedworks Branding */}
        <div className="relative text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Seedworks</h2>
          <p className="text-white/80 text-sm">Your Financial Growth Partner</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-4 grid grid-cols-3 gap-3 -mt-8">
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-scale transform hover:scale-105 transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center animate-glow">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹{profile?.recharge_balance?.toFixed(2) || "50"}</p>
          <p className="text-xs text-gray-400">Recharge</p>
        </div>
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-scale transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center animate-glow">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹{profile?.withdrawal_balance?.toFixed(2) || "0"}</p>
          <p className="text-xs text-gray-400">Withdraw</p>
        </div>
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-scale transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-2 flex items-center justify-center animate-glow">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">₹{profile?.product_income?.toFixed(2) || "0.00"}</p>
          <p className="text-xs text-gray-400">Income</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 grid grid-cols-4 gap-4 mb-6">
        <button onClick={() => navigate("/recharge")} className="flex flex-col items-center gap-2 transform hover:scale-110 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-blue-500/50 animate-fade-scale">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs text-white font-medium">Recharge</span>
        </button>
        <button onClick={() => navigate("/withdraw")} className="flex flex-col items-center gap-2 transform hover:scale-110 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-green-500/50 animate-fade-scale" style={{ animationDelay: '0.1s' }}>
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs text-white font-medium">Withdraw</span>
        </button>
        <button onClick={() => navigate("/team")} className="flex flex-col items-center gap-2 transform hover:scale-110 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-purple-500/50 animate-fade-scale" style={{ animationDelay: '0.2s' }}>
            <Users className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs text-white font-medium">Team</span>
        </button>
        <button onClick={handleTelegram} className="flex flex-col items-center gap-2 transform hover:scale-110 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-pink-500/50 animate-fade-scale" style={{ animationDelay: '0.3s' }}>
            <Send className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs text-white font-medium">Support</span>
        </button>
      </div>

      {/* Invite Section */}
      <div className="mx-4 mb-4 bg-[hsl(var(--navy-medium))] rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-1">Invite Friends to Earn Commission</h3>
        <p className="text-sm text-muted-foreground mb-3">Invest together, grow rich together</p>
        
        <div className="flex items-center gap-2 bg-[hsl(var(--navy-light))] rounded-lg p-3 mb-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total Commission</p>
            <p className="text-2xl font-bold text-foreground">₹0</p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground">Invite Code</p>
            <p className="text-lg font-bold text-foreground">{profile?.invite_code}</p>
          </div>
          <Button size="icon" className="bg-info hover:bg-info/90" onClick={() => {
            const link = `${window.location.origin}/register?invite=${profile?.invite_code}`;
            navigator.clipboard.writeText(link);
            toast.success("Invite link copied!");
          }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[hsl(var(--navy-light))] rounded-lg p-2 text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-1 flex items-center justify-center text-primary-foreground text-xs font-bold">LV1</div>
            <p className="text-xs text-muted-foreground">35%</p>
            <p className="text-xs text-foreground">Lv 1 Rebate</p>
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">{teamStats.level1} Total invite</p>
              <p className="text-xs text-muted-foreground">{teamStats.level1Active} Active</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--navy-light))] rounded-lg p-2 text-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">LV2</div>
            <p className="text-xs text-muted-foreground">2%</p>
            <p className="text-xs text-foreground">Lv 2 Rebate</p>
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">{teamStats.level2} Total invite</p>
              <p className="text-xs text-muted-foreground">{teamStats.level2Active} Active</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--navy-light))] rounded-lg p-2 text-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">LV3</div>
            <p className="text-xs text-muted-foreground">1%</p>
            <p className="text-xs text-foreground">Lv 2 Rebate</p>
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">0 Total invite</p>
              <p className="text-xs text-muted-foreground">0 Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in Section */}
      <div className="mx-4 mb-3 bg-[hsl(var(--navy-medium))] rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="text-foreground font-semibold mb-1 text-sm">Sign in to receive rewards</h3>
          <p className="text-xs text-muted-foreground">Daily check-in can receive ₹0.00</p>
        </div>
        <div className="text-4xl">🎁</div>
        <Button onClick={handleCheckin} size="sm" className="bg-info hover:bg-info/90 text-white rounded-full px-4 shrink-0">
          Sign in now →
        </Button>
      </div>

      {/* Lucky Draw */}
      <div className="mx-4 mb-3 bg-[hsl(var(--navy-medium))] rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="text-foreground font-semibold mb-1 text-sm">Lucky Draw</h3>
          <p className="text-xs text-muted-foreground">The lucky wheel keeps spinning with great gifts</p>
        </div>
        <div className="text-4xl">🎁</div>
        <Button onClick={() => navigate("/lucky-draw")} size="sm" className="bg-info hover:bg-info/90 text-white rounded-full px-4 shrink-0">
          Go →
        </Button>
      </div>

      {/* Task Reward */}
      <div className="mx-4 mb-4 bg-[hsl(var(--navy-medium))] rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="text-foreground font-semibold mb-1 text-sm">Task reward</h3>
          <p className="text-xs text-muted-foreground">Complete tasks and receive a daily salary bonus</p>
        </div>
        <div className="text-4xl">🎁</div>
        <Button onClick={() => navigate("/task-reward")} size="sm" className="bg-info hover:bg-info/90 text-white rounded-full px-4 shrink-0">
          Go →
        </Button>
      </div>

      <WelcomePopup open={showWelcomePopup} onOpenChange={setShowWelcomePopup} />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--navy-medium))] flex justify-around p-2 shadow-lg">
        <button className="flex flex-col items-center gap-1 py-2 px-3" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xs text-primary font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-2 px-3" onClick={() => navigate("/invest")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Invest</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-2 px-3" onClick={() => navigate("/notice")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Notice</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-2 px-3" onClick={() => navigate("/blog")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Blog</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-2 px-3" onClick={() => navigate("/account")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Account</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
