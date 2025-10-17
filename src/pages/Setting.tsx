import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const Setting = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState(logo);
  const [password, setPassword] = useState("");
  const [tradePassword, setTradePassword] = useState("");

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

    if (data) {
      setProfile(data);
      setNickname(data.full_name);
      // Decrypt passwords for display (Base64 decoding)
      if (data.encrypted_password) {
        setPassword(atob(data.encrypted_password));
      }
      if (data.encrypted_trade_password) {
        setTradePassword(atob(data.encrypted_trade_password));
      }
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const encryptedPassword = btoa(password);
    const encryptedTradePassword = btoa(tradePassword);

    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: nickname,
        encrypted_password: encryptedPassword,
        encrypted_trade_password: encryptedTradePassword,
        trade_password: tradePassword
      })
      .eq("user_id", profile.user_id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      navigate("/account");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Setting Info</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-[hsl(var(--navy-medium))] p-4 rounded-lg">
          <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Click to change image</p>
            <p className="text-xs text-muted-foreground mt-1">
              It is recommended to upload an image with a 1:1 ratio and larger than 100px
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-foreground">Nickname</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-200 text-center font-medium">
            🔒 Only you can see your password and trade password
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <Input
            id="password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradePassword" className="text-foreground">Trade Password</Label>
          <Input
            id="tradePassword"
            type="text"
            value={tradePassword}
            onChange={(e) => setTradePassword(e.target.value)}
            placeholder="Enter your trade password"
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>

        <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Save Info
        </Button>
      </div>
    </div>
  );
};

export default Setting;
