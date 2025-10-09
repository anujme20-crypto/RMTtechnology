import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Gift, Send } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const TaskReward = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      
      // Count active users (invited users who made purchases)
      const { data: invitedUsers } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("invited_by", profileData.invite_code);

      if (invitedUsers) {
        let activeCount = 0;
        for (const user of invitedUsers) {
          const { data: purchases } = await supabase
            .from("user_products")
            .select("id")
            .eq("user_id", user.user_id)
            .limit(1);
          
          if (purchases && purchases.length > 0) {
            activeCount++;
          }
        }
        setActiveUsers(activeCount);
      }
    }
  };

  const taskRewards = [
    { id: "task_3", required: 3, reward: 200 },
    { id: "task_70", required: 70, reward: 3000 },
    { id: "task_200", required: 200, reward: 11000 },
    { id: "task_500", required: 500, reward: 55000 },
    { id: "task_1000", required: 1000, reward: 170000 },
  ];

  const dailyRewards = [
    { id: "daily_1", required: 1, reward: 20 },
    { id: "daily_3", required: 3, reward: 50 },
    { id: "daily_20", required: 20, reward: 500 },
  ];

  const handleClaim = async (rewardId: string, reward: number, required: number) => {
    if (activeUsers < required) {
      toast.error(`You need ${required} active users to claim this reward`);
      return;
    }

    if (claimedRewards.includes(rewardId)) {
      toast.error("Reward already claimed");
      return;
    }

    await supabase
      .from("profiles")
      .update({
        withdrawal_balance: profile.withdrawal_balance + reward
      })
      .eq("user_id", profile.user_id);

    await supabase.from("transactions").insert({
      user_id: profile.user_id,
      transaction_type: "reward",
      amount: reward,
      balance_type: "withdrawal",
      description: `Task reward for ${required} active users`,
    });

    setClaimedRewards([...claimedRewards, rewardId]);
    toast.success(`Claimed ₹${reward} reward!`);
    loadData();
  };

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-[#0a1628] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <img src={logo} alt="TCS" className="w-8 h-8" />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-blue-400 hover:bg-[#1e3a5f]" onClick={handleTelegram}>
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6 bg-[#2d4a6f] rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">₹{profile?.total_commission?.toFixed(2) || "0"}</p>
            <p className="text-xs text-white/60">Commission<br/>Fee</p>
          </div>
          <div className="text-center border-l border-white/10 flex flex-col items-center justify-center">
            <p className="text-xl font-bold text-white mb-1">{profile?.invite_code}</p>
            <p className="text-xs text-white/60">Invitation Code</p>
            <Button size="icon" variant="ghost" className="mt-1 h-6 w-6 text-blue-400" onClick={() => {
              const link = `${window.location.origin}/register?invite=${profile?.invite_code}`;
              navigator.clipboard.writeText(link);
              toast.success("Invite link copied!");
            }}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Task Rewards</h2>
        <div className="space-y-3 mb-6">
          {taskRewards.map((task) => (
            <div key={task.id} className="bg-[#2d4a6f] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎁</div>
                <div className="flex-1">
                  <p className="text-sm text-white mb-1">Require: <span className="text-white/80">Invite to activate {task.required} people</span></p>
                  <p className="text-yellow-400 font-bold text-lg">Rewards: ₹{task.reward.toFixed(2)}</p>
                  <div className="mt-2 bg-[#1e3a5f] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full transition-all" 
                      style={{ width: `${Math.min((activeUsers / task.required) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-yellow-400 font-bold">{activeUsers} / {task.required}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">Daily Reward</h2>
        <div className="space-y-3">
          {dailyRewards.map((task) => (
            <div key={task.id} className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Require: Invite to activate {task.required} people</p>
                    <p className="text-primary font-bold">Rewards: ₹{task.reward.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleClaim(task.id, task.reward, task.required)}
                    disabled={activeUsers < task.required || claimedRewards.includes(task.id)}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    Claim
                  </Button>
                  <span className="text-xs text-muted-foreground">{activeUsers}/{task.required}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskReward;
