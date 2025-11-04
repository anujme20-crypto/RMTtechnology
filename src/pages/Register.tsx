import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/seedworks-logo.png";

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

      // SECURITY WARNING: Base64 is NOT secure encryption - it's easily reversible
      // This should be replaced with proper password hashing (bcrypt/argon2)
      // Keeping for backwards compatibility - database migration needed
      const encryptedPassword = btoa(password);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="flex-1 px-6 py-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 animate-fade-scale">
          <img src={logo} alt="Seedworks" className="w-24 h-24 rounded-2xl shadow-2xl animate-glow" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 animate-slide-up">
          <span className="gradient-text">Join Seedworks</span>
        </h1>
        <p className="text-center text-gray-400 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Start Your Investment Journey Today
        </p>
        
        <form onSubmit={handleRegister} className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-gray-300 font-medium">Mobile Number</Label>
            <div className="flex gap-2">
              <div className="glass-effect px-4 py-3 rounded-xl text-white font-semibold">
                +91
              </div>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="flex-1 glass-effect border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300 font-medium">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite" className="text-gray-300 font-medium">Invite Code (Optional)</Label>
            <Input
              id="invite"
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradePassword" className="text-gray-300 font-medium">Trade Password</Label>
            <Input
              id="tradePassword"
              type="password"
              placeholder="Enter trade password"
              value={tradePassword}
              onChange={(e) => setTradePassword(e.target.value)}
              required
              className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full glass-effect border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-semibold py-6 rounded-xl"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
