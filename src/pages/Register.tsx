import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import earthMap from "@/assets/earth-map.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(searchParams.get("invite") || "");
  const [tradePassword, setTradePassword] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile number starts with 6, 7, 8, or 9
    if (!['6', '7', '8', '9'].includes(mobileNumber[0])) {
      toast.error("Mobile number must start with 6, 7, 8, or 9");
      return;
    }

    setLoading(true);

    try {
      // Check if mobile number already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("mobile_number", mobileNumber)
        .maybeSingle();

      if (existingProfile) {
        toast.error("Mobile number already registered");
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${mobileNumber}@ramanna.app`,
        password: password,
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Registration failed");
        return;
      }

      // Encrypt passwords with simple encoding
      const encryptedPassword = btoa(password); // Base64 encoding
      const encryptedTradePassword = btoa(tradePassword);

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: authData.user.id,
          mobile_number: mobileNumber,
          full_name: fullName,
          trade_password: tradePassword,
          encrypted_password: encryptedPassword,
          encrypted_trade_password: encryptedTradePassword,
          invite_code: generateInviteCode(),
          invited_by: inviteCode || null,
        });

      if (profileError) {
        toast.error("Failed to create profile");
        return;
      }

      // Create registration reward transaction
      await supabase.from("transactions").insert({
        user_id: authData.user.id,
        transaction_type: "reward",
        amount: 20.00,
        balance_type: "recharge",
        description: "Registration reward",
      });

      // Registration successful, redirect to login
      toast.success("Registration successful! Please login");
      navigate("/login");
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <img src={earthMap} alt="Earth Map" className="w-full h-full object-cover opacity-40" />
      </div>
      
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          Technology Group of Institute
        </h1>
        
        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-white">Mobile Number</Label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 py-2 bg-[#1e3a5f] border border-[#2d4a6f] rounded-lg text-white/70">
                +91
              </span>
              <Input
                id="mobile"
                type="tel"
                placeholder="Please enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="flex-1 bg-[#1e3a5f] border-[#2d4a6f] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Please enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-[#1e3a5f] border-[#2d4a6f] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#1e3a5f] border-[#2d4a6f] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite" className="text-white">Invite Code</Label>
            <Input
              id="invite"
              type="text"
              placeholder="Please enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="bg-[#1e3a5f] border-[#2d4a6f] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradePassword" className="text-white">Trade Password</Label>
            <Input
              id="tradePassword"
              type="password"
              placeholder="Please enter your trade password"
              value={tradePassword}
              onChange={(e) => setTradePassword(e.target.value)}
              required
              className="bg-[#1e3a5f] border-[#2d4a6f] text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
            {loading ? "Registering..." : "Register Now"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
