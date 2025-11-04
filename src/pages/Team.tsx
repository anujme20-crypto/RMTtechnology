import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Copy } from "lucide-react";

const Team = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [teamStats, setTeamStats] = useState({ 
    level1: 0, level1Active: 0,
    level2: 0, level2Active: 0,
    level3: 0, level3Active: 0
  });

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

    if (profileData) {
      setProfile(profileData);

      // Get level 1 referrals (direct invites)
      const { data: level1 } = await supabase
        .from("profiles")
        .select("user_id, invite_code")
        .eq("invited_by", profileData.invite_code);

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
          .select("user_id, invite_code")
          .in("invited_by", level1Codes);

        level2Count = level2?.length || 0;

        // Get level 2 active users
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

        // Get level 3 referrals (invites of level 2)
        let level3Count = 0;
        let level3Active = 0;
        if (level2 && level2.length > 0) {
          const level2Codes = level2.map(u => u.invite_code);
          const { data: level3 } = await supabase
            .from("profiles")
            .select("user_id")
            .in("invited_by", level2Codes);

          level3Count = level3?.length || 0;

          // Get level 3 active users
          if (level3 && level3.length > 0) {
            const { data: stableProducts } = await supabase
              .from("user_products")
              .select("user_id, product_id")
              .in("user_id", level3.map(u => u.user_id))
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
              level3Active = new Set(activeUserIds).size;
            }
          }
        }

        setTeamStats({ 
          level1: level1Count, level1Active,
          level2: level2Count, level2Active,
          level3: level3Count, level3Active
        });
      } else {
        setTeamStats({ 
          level1: level1Count, level1Active,
          level2: 0, level2Active: 0,
          level3: 0, level3Active: 0
        });
      }
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/register?invite=${profile?.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] p-4">
      <div className="flex items-center gap-3 mb-6 animate-slide-up">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="glass-effect text-white hover:bg-purple-500/20 transform hover:scale-110 transition-all">
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold gradient-text">Team Overview</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-effect rounded-2xl p-5 border border-purple-500/30 animate-fade-scale transform hover:scale-105 transition-all">
          <p className="text-sm text-gray-400 mb-2">Total Commission</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">₹{profile?.total_commission?.toFixed(2)}</p>
        </div>
        <div className="glass-effect rounded-2xl p-5 border border-blue-500/30 animate-fade-scale transform hover:scale-105 transition-all" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm text-gray-400 mb-2">Invite Code</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-mono font-bold text-white">{profile?.invite_code}</p>
            <Button size="icon" variant="ghost" onClick={copyInviteLink} className="hover:bg-blue-500/20 transform hover:scale-110 transition-all">
              <Copy className="w-4 h-4 text-blue-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Team Levels</h2>
        
        <div className="glass-effect rounded-2xl p-5 border border-purple-500/30 transform hover:scale-105 transition-all animate-fade-scale">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-2 flex items-center justify-center animate-glow shadow-lg">
                <p className="font-bold text-white text-lg">LV1</p>
              </div>
              <p className="text-xs text-gray-400 mb-1">Rebate</p>
              <p className="font-bold text-green-400 text-lg">35%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Total Invite</p>
              <p className="text-2xl font-bold text-white">{teamStats.level1}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Active</p>
              <p className="text-2xl font-bold text-green-400">{teamStats.level1Active}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <div className="inline-flex px-3 py-1 bg-green-500/20 rounded-full">
                <p className="text-xs font-semibold text-green-400">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-5 border border-blue-500/30 transform hover:scale-105 transition-all animate-fade-scale" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-2 flex items-center justify-center animate-glow shadow-lg">
                <p className="font-bold text-white text-lg">LV2</p>
              </div>
              <p className="text-xs text-gray-400 mb-1">Rebate</p>
              <p className="font-bold text-green-400 text-lg">2%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Total Invite</p>
              <p className="text-2xl font-bold text-white">{teamStats.level2}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Active</p>
              <p className="text-2xl font-bold text-green-400">{teamStats.level2Active}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <div className="inline-flex px-3 py-1 bg-blue-500/20 rounded-full">
                <p className="text-xs font-semibold text-blue-400">Growing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-5 border border-orange-500/30 transform hover:scale-105 transition-all animate-fade-scale" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-2 flex items-center justify-center animate-glow shadow-lg">
                <p className="font-bold text-white text-lg">LV3</p>
              </div>
              <p className="text-xs text-gray-400 mb-1">Rebate</p>
              <p className="font-bold text-green-400 text-lg">1%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Total Invite</p>
              <p className="text-2xl font-bold text-white">{teamStats.level3}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Active</p>
              <p className="text-2xl font-bold text-green-400">{teamStats.level3Active}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Status</p>
              <div className="inline-flex px-3 py-1 bg-orange-500/20 rounded-full">
                <p className="text-xs font-semibold text-orange-400">Expanding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
