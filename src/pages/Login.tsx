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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <div className="flex-1 px-6 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <img src={logo} alt="Seedworks" className="w-24 h-24 object-contain" />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-gray-700 font-medium text-sm">Phone Number</Label>
            <div className="flex gap-3">
              <div className="bg-white px-4 py-3 rounded-xl text-gray-800 font-semibold border border-gray-200 flex items-center">
                +91
              </div>
              <Input
                id="mobile"
                type="tel"
                placeholder="Please enter your phone number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="flex-1 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#0ea5e9] rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Login Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Login Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#0ea5e9] rounded-xl h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-6 rounded-2xl shadow-lg transition-all duration-300" 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-6 rounded-2xl transition-all duration-300"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
