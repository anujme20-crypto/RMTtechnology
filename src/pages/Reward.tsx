import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const Reward = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("transaction_type", "reward")
      .order("created_at", { ascending: false });

    if (data) setRewards(data);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))]">
      <div className="bg-[hsl(var(--navy-medium))] p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Rewards</h1>
      </div>

      <div className="p-4 space-y-3">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-[hsl(var(--navy-medium))] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-foreground font-semibold">{reward.description || "Register Rewards"}</p>
                <p className="text-xs text-muted-foreground">{new Date(reward.created_at).toLocaleString()}</p>
              </div>
              <span className="text-success font-bold text-lg">+ ₹{reward.amount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground capitalize">{reward.balance_type} Balance</p>
          </div>
        ))}
        {rewards.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No rewards yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Reward;
