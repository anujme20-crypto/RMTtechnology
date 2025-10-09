import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

const MyPrizes = () => {
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("prizes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setPrizes(data);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900">
      <div className="bg-black/20 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-white/10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-white">My Prizes</h1>
      </div>

      <div className="p-4 space-y-3">
        {prizes.map((prize) => (
          <div 
            key={prize.id} 
            className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-2xl p-5 flex justify-between items-center border border-white/20 shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎁</span>
                <p className="text-white font-bold text-lg">Lucky Draw Reward</p>
              </div>
              <p className="text-sm text-white/70">{new Date(prize.created_at).toLocaleString()}</p>
            </div>
            <span className="text-yellow-400 font-bold text-2xl drop-shadow-lg">+ ₹{prize.reward_amount.toFixed(2)}</span>
          </div>
        ))}
        {prizes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-white/70 text-lg">No prizes yet</p>
            <p className="text-white/50 text-sm mt-2">Try your luck on the spinning wheel!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPrizes;
