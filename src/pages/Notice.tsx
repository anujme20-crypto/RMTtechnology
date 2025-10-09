import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

const Notice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))]">
      <div className="bg-[hsl(var(--navy-medium))] p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Notice</h1>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-[hsl(var(--navy-medium))] rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-[hsl(var(--navy-light))] transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">👥</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Invite Friends Bonus</h3>
            <p className="text-xs text-muted-foreground">2025-09-22 11:05:00</p>
          </div>
        </div>
        <div className="bg-[hsl(var(--navy-medium))] rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-[hsl(var(--navy-light))] transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">👑</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">VIP Member Sign-in...</h3>
            <p className="text-xs text-muted-foreground">2025-09-22 11:03:57</p>
          </div>
        </div>
        <div onClick={() => navigate("/lucky-draw")} className="bg-[hsl(var(--navy-medium))] rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-[hsl(var(--navy-light))] transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">The Lucky Wheel</h3>
            <p className="text-xs text-muted-foreground">2025-09-22 11:01:36</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Notice;
