import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Copy } from "lucide-react";

const Team = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [teamStats, setTeamStats] = useState({ level1: 0, level1Active: 0 });

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

      // Get level 1 referrals
      const { data: level1 } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("invited_by", profileData.invite_code);

      const level1Count = level1?.length || 0;

      // Get active users (those who purchased)
      let level1Active = 0;
      if (level1 && level1.length > 0) {
        const { data: activeUsers } = await supabase
          .from("user_products")
          .select("user_id")
          .in("user_id", level1.map(u => u.user_id))
          .eq("is_active", true);
        
        level1Active = new Set(activeUsers?.map(u => u.user_id)).size;
      }

      setTeamStats({ level1: level1Count, level1Active });
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
              <p className="font-semibold">0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="font-semibold">0</p>
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
              <p className="font-semibold">0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active</p>
              <p className="font-semibold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
