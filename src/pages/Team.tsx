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
      const { data: level1, error: level1Error } = await supabase
        .from("profiles")
        .select("user_id, invite_code")
        .eq("invited_by", profileData.invite_code);

      if (level1Error) {
        console.error("Error fetching level 1:", level1Error);
      }
      console.log("Level 1 referrals:", level1);

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
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Team</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Commission</p>
          <p className="text-2xl font-bold text-primary">₹{profile?.total_commission?.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-mono font-bold">{profile?.invite_code}</p>
            <Button size="icon" variant="ghost" onClick={copyInviteLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-3">Team Levels</h2>
        
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <p className="font-semibold">LV1</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rebate</p>
              <p className="font-semibold text-success">35%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Invite</p>
              <p className="font-semibold">{teamStats.level1}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="font-semibold">{teamStats.level1Active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <p className="font-semibold">LV2</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rebate</p>
              <p className="font-semibold text-success">2%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Invite</p>
              <p className="font-semibold">{teamStats.level2}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="font-semibold">{teamStats.level2Active}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <p className="font-semibold">LV3</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rebate</p>
              <p className="font-semibold text-success">1%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Invite</p>
              <p className="font-semibold">{teamStats.level3}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="font-semibold">{teamStats.level3Active}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
