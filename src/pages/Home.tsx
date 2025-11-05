import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Wallet, CreditCard, MessageCircle, User, Gift, Target, Trophy, ShoppingBag } from "lucide-react";
import logo from "@/assets/seedworks-logo.png";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import { WelcomePopup } from "@/components/WelcomePopup";

const Home = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [selectedTab, setSelectedTab] = useState("stable");
  const [balances, setBalances] = useState({
    recharge: 0,
    withdraw: 0,
    income: 0,
    pending: 0
  });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    setTimeout(() => setShowWelcomePopup(true), 500);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedTab]);

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
      setBalances({
        recharge: data.recharge_balance || 0,
        withdraw: data.withdrawal_balance || 0,
        income: data.product_income || 0,
        pending: 0
      });
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("product_type", selectedTab)
      .order("amount", { ascending: true });

    if (data) {
      setProducts(data);
    }
  };

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  const currentProducts = products.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] pb-20">
      <WelcomePopup open={showWelcomePopup} onOpenChange={setShowWelcomePopup} />
      
      <div className="relative bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] p-6 pb-8">
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">SAMSUNG</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={handleTelegram}>
              <Bell className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-white/90 text-xs mb-1">Recharge</div>
            <div className="text-white text-lg font-bold">₹{balances.recharge.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-white/90 text-xs mb-1">Withdraw</div>
            <div className="text-white text-lg font-bold">₹{balances.withdraw.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-white/90 text-xs mb-1">Income</div>
            <div className="text-white text-lg font-bold">₹{balances.income.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-white/90 text-xs mb-1">Pending</div>
            <div className="text-white text-lg font-bold">₹{balances.pending.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12" onClick={() => navigate("/account")}>
            <User className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-12 h-12 relative" onClick={() => navigate("/my-orders")}>
            <ShoppingBag className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          <Button onClick={() => navigate("/recharge")} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <Wallet className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Recharge</span>
          </Button>
          <Button onClick={() => navigate("/withdraw")} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <CreditCard className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Withdraw</span>
          </Button>
          <Button onClick={() => navigate("/task-reward")} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <Gift className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Task</span>
          </Button>
          <Button onClick={() => navigate("/task-reward")} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <Target className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Dailytask</span>
          </Button>
          <Button onClick={() => navigate("/lucky-draw")} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <Trophy className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Draw</span>
          </Button>
          <Button onClick={handleTelegram} className="flex flex-col h-20 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl">
            <MessageCircle className="w-6 h-6 mb-1 text-white" />
            <span className="text-xs text-white">Telegram</span>
          </Button>
        </div>
      </div>

      <div className="p-4 -mt-2">
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setSelectedTab("stable")}
            className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all ${
              selectedTab === "stable"
                ? "bg-[#0ea5e9] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Stable
          </Button>
          <Button
            onClick={() => setSelectedTab("welfare")}
            className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all ${
              selectedTab === "welfare"
                ? "bg-[#0ea5e9] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Welfare
          </Button>
          <Button
            onClick={() => setSelectedTab("activity")}
            className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all relative ${
              selectedTab === "activity"
                ? "bg-[#0ea5e9] text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Activity
            {selectedTab !== "activity" && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">HOT</span>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-5 shadow-lg transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/invest/${product.id}`)}
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded-2xl shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-gray-800 font-bold text-base mb-3">{product.title}</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Amount</span>
                      <span className="text-gray-800 font-bold">₹{product.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Cycle</span>
                      <span className="text-gray-800 font-semibold">{product.cycle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Daily income</span>
                      <span className="text-gray-800 font-bold">₹{product.daily_income}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Total Return</span>
                      <span className="text-gray-800 font-bold">₹{product.total_return}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white font-bold py-3 rounded-2xl shadow-lg">
                    Invest Now &gt;
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;