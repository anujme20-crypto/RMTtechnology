import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const Vip = () => {
  const navigate = useNavigate();
  const [totalRecharge, setTotalRecharge] = useState(0);

  useEffect(() => {
    loadTotalRecharge();
  }, []);

  const loadTotalRecharge = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", session.user.id)
      .eq("transaction_type", "recharge");

    if (data) {
      const total = data.reduce((sum, tx) => sum + tx.amount, 0);
      setTotalRecharge(total);
    }
  };

  const vipLevels = [
    { level: 0, amount: 0, current: true },
    { level: 1, amount: 390 },
    { level: 2, amount: 4770 },
    { level: 3, amount: 11770 },
    { level: 4, amount: 22770 },
    { level: 5, amount: 44770 },
    { level: 6, amount: 55770 },
  ];

  const getCurrentVIP = () => {
    for (let i = vipLevels.length - 1; i >= 0; i--) {
      if (totalRecharge >= vipLevels[i].amount) {
        return vipLevels[i].level;
      }
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">VIP Level</h1>
      </div>

      <div className="space-y-6">
        {vipLevels.map((vip, index) => {
          const isCurrentOrPassed = totalRecharge >= vip.amount;
          const progress = index === 0 ? 100 : Math.min((totalRecharge / vip.amount) * 100, 100);

          return (
            <div key={vip.level} className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold ${isCurrentOrPassed ? 'text-primary' : 'text-muted-foreground'}`}>
                  VIP{vip.level}
                </span>
                {getCurrentVIP() === vip.level && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>
              {vip.level > 0 && (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upgrade to VIP {vip.level} when your total investment reaches ₹{vip.amount.toFixed(2)}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Total investment amount</span>
                    <span>{totalRecharge.toFixed(2)}/{vip.amount.toFixed(2)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Vip;
