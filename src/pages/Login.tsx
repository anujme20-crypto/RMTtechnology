import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import earthMap from "@/assets/earth-map.png";

const Login = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = `${mobileNumber}@ramanna.app`;
      
      // Regular user login flow
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
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <div className="relative w-full h-48 overflow-hidden">
        <img src={earthMap} alt="Earth Map" className="w-full h-full object-cover opacity-40" />
      </div>
      
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">
          Technology Group of Institute
        </h1>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
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

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
            {loading ? "Logging in..." : "Login Now"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10"
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
