import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";

const InvestNow = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

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

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (profileData) setProfile(profileData);
    if (productData) setProduct(productData);
  };

  const handleInvest = async () => {
    if (!profile || !product) return;

    if (profile.recharge_balance < product.price) {
      toast.error("Insufficient recharge balance");
      return;
    }

    // Check VIP level for welfare products
    if (product.category === "welfare") {
      const { data: userProducts } = await supabase
        .from("user_products")
        .select("*, products(*)")
        .eq("user_id", profile.user_id)
        .eq("is_active", true);

      const stableProducts = userProducts?.filter((up: any) => up.products.category === "stable");
      const hasRequiredVIP = stableProducts?.some((up: any) => up.products.vip_level >= product.vip_level);

      if (!hasRequiredVIP) {
        toast.error(`You must purchase Stable VIP ${product.vip_level} first`);
        return;
      }

      // Check if already purchased (welfare products can only be bought once)
      const alreadyPurchased = userProducts?.some((up: any) => up.product_id === product.id);
      if (alreadyPurchased) {
        toast.error("You have already purchased this product");
        return;
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + product.revenue_days);

    await supabase.from("user_products").insert({
      user_id: profile.user_id,
      product_id: product.id,
      expiry_date: expiryDate.toISOString(),
      days_remaining: product.revenue_days,
    });

    await supabase
      .from("profiles")
      .update({
        recharge_balance: profile.recharge_balance - product.price
      })
      .eq("user_id", profile.user_id);

    await supabase.from("transactions").insert({
      user_id: profile.user_id,
      transaction_type: "product_buy",
      amount: -product.price,
      balance_type: "recharge",
      description: `Purchased ${product.name}`,
    });

    toast.success("Product purchased successfully!");
    navigate("/my-orders");
  };

  if (!product) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a5f] p-4 flex items-center justify-between border-b border-[#2d4a6f]">
        <button onClick={() => navigate(-1)} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold">product_CARGILL</h1>
        <button className="text-white">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Close button top right */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-20 right-4 text-white/60 hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12">
        {/* Product Image */}
        <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-4 border-[#2d4a6f]">
          <img src={logo} alt={product.name} className="w-full h-full object-cover" />
        </div>
        
        <h2 className="text-lg font-semibold mb-8 text-white">Upgrade to VIP{product.vip_level}</h2>
        
        {/* Details List */}
        <div className="w-full max-w-sm space-y-0 mb-8">
          <div className="flex justify-between py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Price per piece</span>
            <span className="font-semibold text-white">₹{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Daily Earnings</span>
            <span className="font-semibold text-white">₹{product.daily_earnings.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Revenue</span>
            <span className="font-semibold text-white">{product.revenue_days} Days</span>
          </div>
          <div className="flex justify-between py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Total Revenue</span>
            <span className="font-semibold text-white">₹{(product.daily_earnings * product.revenue_days).toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Quantity to Buy</span>
            <div className="flex items-center gap-3">
              <button className="w-7 h-7 border border-[#2d4a6f] rounded flex items-center justify-center text-white hover:bg-[#2d4a6f]">
                −
              </button>
              <span className="w-8 text-center text-white font-medium">1</span>
              <button className="w-7 h-7 border border-[#2d4a6f] rounded flex items-center justify-center text-white hover:bg-[#2d4a6f]">
                +
              </button>
            </div>
          </div>
          <div className="flex justify-between py-3 border-b border-[#2d4a6f]">
            <span className="text-white/60">Pay Money</span>
            <span className="font-bold text-white">₹{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-white/60">Expected total revenue</span>
            <span className="font-bold text-white">₹{(product.daily_earnings * product.revenue_days).toFixed(1)}</span>
          </div>
        </div>

        {/* Invest Button */}
        <Button
          onClick={handleInvest}
          className="w-full max-w-sm bg-[#2d4a6f] hover:bg-[#3a5f95] h-12 text-lg text-white rounded-xl border border-[#3a5f95] font-semibold"
        >
          Invest Now
        </Button>
      </div>
    </div>
  );
};

export default InvestNow;
