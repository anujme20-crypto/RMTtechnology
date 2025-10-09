import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const Balance = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#2d4a6f] p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-[#3a5f95]">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-white">My Bill</h1>
      </div>

      <div className="p-4 space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-[#2d4a6f] rounded-lg p-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-white font-semibold capitalize">{tx.transaction_type.replace('_', ' ')}</p>
                <p className="text-xs text-white/60">{new Date(tx.created_at).toLocaleString()}</p>
              </div>
              <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''} ₹{Math.abs(tx.amount).toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-white/60 capitalize">{tx.balance_type} balance</p>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-12 text-white/60">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Balance;
