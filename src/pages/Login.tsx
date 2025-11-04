import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/seedworks-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Regular user login flow - no hardcoded credentials
      const email = `${mobileNumber}@ramanna.app`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Better error messages
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email first");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid mobile number or password");
        } else {
          toast.error("Login failed. Please try again.");
        }
        
        setLoading(false);
        return;
      }

      // Verify session was created
      if (data?.session) {
        toast.success("Login successful!");
        
        // Check if user is admin via database only
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Failed to create session");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f35] to-[#0a0e1a] flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="flex-1 px-6 py-12 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-scale">
          <div className="relative">
            <img src={logo} alt="Seedworks" className="w-32 h-32 rounded-3xl shadow-2xl animate-glow" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-3xl blur-xl"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-3 animate-slide-up">
          <span className="gradient-text">Seedworks</span>
        </h1>
        <p className="text-center text-gray-400 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Gateway to Financial Freedom
        </p>
        
        <form onSubmit={handleLogin} className="space-y-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-3">
            <Label htmlFor="mobile" className="text-gray-300 font-medium">Mobile Number</Label>
            <div className="flex gap-3">
              <div className="glass-effect px-4 py-3 rounded-xl text-white font-semibold">
                +91
              </div>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="flex-1 glass-effect border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-effect border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login Now"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full glass-effect border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-semibold py-6 rounded-xl transition-all duration-300"
            onClick={() => navigate("/register")}
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
