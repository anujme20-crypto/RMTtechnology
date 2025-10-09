import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

const LuckyDraw = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) setProfile(data);
  };

  const handleSpin = async () => {
    if (!profile || profile.spin_chances < 1) {
      toast.error("You don't have any spin chances");
      return;
    }

    setSpinning(true);
    
    // Spin animation - multiple rotations plus random landing
    const spins = 5; // Number of full rotations
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (spins * 360) + randomDegree;
    setRotation(totalRotation);
    
    setTimeout(async () => {
      const reward = 10;
      
      await supabase
        .from("profiles")
        .update({
          spin_chances: profile.spin_chances - 1,
          withdrawal_balance: profile.withdrawal_balance + reward
        })
        .eq("user_id", profile.user_id);

      await supabase.from("transactions").insert({
        user_id: profile.user_id,
        transaction_type: "spin",
        amount: reward,
        balance_type: "withdrawal",
        description: "Lucky spin reward",
      });

      await supabase.from("prizes").insert({
        user_id: profile.user_id,
        reward_amount: reward,
      });

      toast.success(`Congratulations! You won ₹${reward}`);
      setSpinning(false);
      loadProfile();
    }, 4000);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse delay-100"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-green-400 rounded-full blur-3xl animate-pulse delay-200"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-white">Lottery</h1>
          <p className="text-xs text-white/70">tcshightech1.com/lottery</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Top Buttons */}
      <div className="relative z-10 px-4 mb-4 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => toast.info("Description coming soon")}
        >
          Description
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => navigate("/my-prizes")}
        >
          My prizes
        </Button>
      </div>

      {/* Lucky Spinning Section */}
      <div className="relative z-10 text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Lucky spinning</h2>
        <p className="text-white/80 text-sm">Turn the wheel and win amazing prizes!</p>
      </div>

      {/* Wheel Container */}
      <div className="relative z-10 flex items-center justify-center mb-8 px-4">
        <div className="relative w-80 h-80">
          {/* Outer glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/40 via-pink-500/40 to-purple-600/40 blur-2xl animate-pulse" />
          
          {/* Wheel with border */}
          <div className="absolute inset-2 rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden">
            <div 
              className="absolute inset-0 rounded-full transition-transform duration-[4000ms] ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                background: 'conic-gradient(from 0deg, #FF1744 0deg 45deg, #FFD700 45deg 90deg, #00E676 90deg 135deg, #2196F3 135deg 180deg, #9C27B0 180deg 225deg, #FF6B00 225deg 270deg, #E91E63 270deg 315deg, #FFC107 315deg 360deg)'
              }}
            >
              {/* Prize labels on wheel segments */}
              {[10, 20, 30, 50, 100, 200, 500, 1000].map((prize, index) => {
                const angle = (index * 45) - 67.5; // Center text in each segment
                const radius = 110; // Distance from center
                const x = radius * Math.cos((angle * Math.PI) / 180);
                const y = radius * Math.sin((angle * Math.PI) / 180);
                
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 left-1/2 text-white font-bold drop-shadow-lg"
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle + 67.5}deg)`,
                      fontSize: prize >= 100 ? '18px' : '16px'
                    }}
                  >
                    ₹{prize}
                  </div>
                );
              })}

              {/* White dividing lines */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-left"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    width: '50%',
                    height: '3px',
                    backgroundColor: 'white'
                  }}
                />
              ))}
            </div>

            {/* Center Button with golden shine */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-2xl flex items-center justify-center border-4 border-white">
                <Button
                  onClick={handleSpin}
                  disabled={spinning || profile?.spin_chances < 1}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold text-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {spinning ? "..." : "GO"}
                </Button>
              </div>
            </div>
          </div>

          {/* Pointer/Arrow at top */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[32px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-2xl" 
                 style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} 
            />
          </div>
        </div>
      </div>

      {/* Chances Display */}
      <div className="relative z-10 text-center px-4 mb-6">
        <div className="bg-black/30 backdrop-blur-sm rounded-full py-3 px-6 inline-block border border-white/20">
          <p className="text-white text-sm">
            You have <span className="text-yellow-400 font-bold text-lg">{profile?.spin_chances || 0}</span> chances to participate in the lottery
          </p>
        </div>
      </div>

      {/* My Prizes Button */}
      <div className="relative z-10 px-4 mb-20">
        <Button
          onClick={() => navigate("/my-prizes")}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-2xl shadow-xl"
        >
          <span className="text-2xl mr-2">🏆</span>
          My Prizes
        </Button>
      </div>

      {/* Prize Display Section */}
      <div className="relative z-10 bg-gradient-to-br from-amber-100 to-yellow-200 mx-4 rounded-t-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="text-4xl">🏆</div>
          <h3 className="text-2xl font-bold text-amber-900">Prize Display</h3>
          <div className="text-4xl">🏆</div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: "🎁", amount: "8", color: "from-pink-500 to-purple-600" },
            { emoji: "💰", amount: "70", color: "from-green-500 to-emerald-600" },
            { emoji: "🎯", amount: "49", color: "from-blue-500 to-cyan-600" },
            { emoji: "⭐", amount: "7", color: "from-yellow-500 to-orange-600" },
          ].map((prize, i) => (
            <div key={i} className={`bg-gradient-to-br ${prize.color} rounded-xl p-3 text-center shadow-lg`}>
              <div className="text-2xl mb-1">{prize.emoji}</div>
              <div className="text-white font-bold text-lg">{prize.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
