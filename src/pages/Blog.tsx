import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { RulePopup } from "@/components/RulePopup";
import logo from "@/assets/seedworks-logo.png";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

const Blog = () => {
  const navigate = useNavigate();
  const [showRulePopup, setShowRulePopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleTelegram = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] p-4 pb-20">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Seedworks" className="w-12 h-12 rounded-2xl shadow-lg animate-glow" />
          <h2 className="text-lg font-bold text-white">Seedworks Blog</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleTelegram} className="text-white hover:bg-purple-500/20 transform hover:scale-110 transition-all">
          <Bell />
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={() => setShowRulePopup(true)} variant="outline" className="flex-1 bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-light))] text-foreground">
          Rule
        </Button>
        <Button onClick={() => navigate("/publish")} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Publish
        </Button>
      </div>

      <RulePopup open={showRulePopup} onOpenChange={setShowRulePopup} />

      <div className="text-center text-muted-foreground py-8">
        No blog posts yet
      </div>
      <BottomNav />
    </div>
  );
};

export default Blog;
