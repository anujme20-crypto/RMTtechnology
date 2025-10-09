import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Bell, ClipboardList } from "lucide-react";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

const Invest = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("vip_level", { ascending: true });

    if (data) setProducts(data);
  };

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  const renderProducts = (category: string) => {
    const categoryProducts = products.filter(p => p.category === category);
    
    return categoryProducts.map((product) => (
      <div key={product.id} className="bg-[#2d4a6f] rounded-2xl p-4 border border-[#3a5f95] mb-3">
        <div className="flex gap-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl overflow-hidden flex-shrink-0">
            <img src={logo} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1 text-sm">Upgrade to {product.name}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
              <p className="text-white/60">Daily Earnings</p>
              <p className="text-white font-medium text-right">₹{product.daily_earnings}</p>
              <p className="text-white/60">Total Revenue</p>
              <p className="text-white font-medium text-right">₹{product.total_revenue}</p>
              <p className="text-white/60">Revenue</p>
              <p className="text-white font-medium text-right">{product.revenue_days} Days</p>
              <p className="text-white/60">Maximum</p>
              <p className="text-white font-medium text-right">{product.maximum_purchase}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-blue-500/10 rounded-full py-2 px-4 border border-blue-500/20">
            <span className="text-sm font-semibold text-white">Price ₹{product.price}</span>
          </div>
          <Button
            onClick={() => navigate(`/invest/${product.id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 font-medium"
          >
            Invest Now
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0a1628] pb-20">
      {/* Header */}
      <div className="bg-[#1e3a5f] p-4 border-b border-[#2d4a6f]">
        <div className="flex items-center justify-between">
          <img src={logo} alt="Logo" className="w-32 h-auto" />
          <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-[#2d4a6f]" onClick={handleTelegram}>
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="stable" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-[#1e3a5f] border border-[#2d4a6f] rounded-xl p-1 mb-4">
            <TabsTrigger 
              value="stable" 
              className="rounded-lg text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Stable
            </TabsTrigger>
            <TabsTrigger 
              value="welfare"
              className="rounded-lg text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Welfare
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="rounded-lg text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Activity
            </TabsTrigger>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1 text-blue-400"
              onClick={() => navigate("/my-orders")}
            >
              <ClipboardList className="w-5 h-5" />
            </Button>
          </TabsList>
          
          <TabsContent value="stable" className="mt-0">
            <div className="bg-[#1e3a5f]/50 rounded-xl p-3 mb-4 border border-[#2d4a6f]">
              <h3 className="text-white font-semibold text-sm mb-1">Introduction to Stable Product</h3>
              <p className="text-xs text-white/70">Stability and high returns coexist. You deserve the best financial choice!</p>
            </div>
            {renderProducts("stable")}
          </TabsContent>
          
          <TabsContent value="welfare" className="mt-0">
            <div className="bg-[#1e3a5f]/50 rounded-xl p-3 mb-4 border border-[#2d4a6f]">
              <h3 className="text-white font-semibold text-sm mb-1">Introduction to Welfare Product</h3>
              <p className="text-xs text-white/70">Low cycle, high returns. Enjoy the joy of increasing asset value!</p>
            </div>
            {renderProducts("welfare")}
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <div className="bg-[#1e3a5f]/50 rounded-xl p-3 mb-4 border border-[#2d4a6f]">
              <h3 className="text-white font-semibold text-sm mb-1">Introduction to Activity Product</h3>
              <p className="text-xs text-white/70">Safe and stable returns, protecting the growth of your asset value!</p>
            </div>
            {renderProducts("activity")}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Invest;
