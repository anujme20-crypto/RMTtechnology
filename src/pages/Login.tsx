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
      // Special admin credentials - auto-create if doesn't exist
      const isAdminCredentials = mobileNumber === "@#₹₹#@62687337Ayush" && password === "@#₹₹#@62639603Ayush";
      
      // Store credentials for persistent login (1 month)
      if (!isAdminCredentials) {
        localStorage.setItem('rememberedUser', mobileNumber);
      }
      
      if (isAdminCredentials) {
        const adminEmail = "admin62687337@ramanna.app";
        
        try {
          // Try to sign in first
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: password,
          });

          let userId = signInData?.user?.id;

          // If sign in failed, try to create admin user
          if (signInError) {
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email: adminEmail,
              password: password,
            });

            if (signUpError) {
              // If signup also fails, it might mean user already exists
              // Try sign in one more time
              const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password: password,
              });

              if (retryError || !retrySignIn?.user) {
                toast.error("Admin login failed. Please try again.");
                setLoading(false);
                return;
              }
              
              userId = retrySignIn.user.id;
            } else if (authData.user) {
              userId = authData.user.id;

              // Create profile for new admin
              try {
                await supabase.from("profiles").insert({
                  user_id: authData.user.id,
                  mobile_number: mobileNumber,
                  full_name: "Admin",
                  trade_password: password,
                  invite_code: "ADMIN001",
                });
              } catch (profileError) {
                // Ignore if profile already exists
                console.log("Profile creation skipped:", profileError);
              }
            }
          }

          if (!userId) {
            toast.error("Failed to get admin user");
            setLoading(false);
            return;
          }

          // Ensure admin role exists
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .eq("role", "admin")
            .maybeSingle();

          if (!existingRole) {
            try {
              await supabase.from("user_roles").insert({
                user_id: userId,
                role: "admin",
              });
            } catch (roleError) {
              // Ignore duplicate errors
              console.log("Role creation skipped:", roleError);
            }
          }

          // Store admin session marker
          localStorage.setItem('isAdmin', 'true');
          
          toast.success("Admin login successful!");
          navigate("/admin");
          setLoading(false);
          return;
        } catch (err) {
          console.error("Admin login error:", err);
          toast.error("Admin login failed");
          setLoading(false);
          return;
        }
      }

      // Get user profile by mobile number first to verify user exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("mobile_number", mobileNumber)
        .maybeSingle();

      // Sign in with Supabase auth (don't fail if profile doesn't exist yet)
      const emailToUse = isAdminCredentials ? `admin62687337@ramanna.app` : `${mobileNumber}@ramanna.app`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
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
        // Session is automatically persisted by Supabase with auto-refresh enabled
        // Store 30-day expiry marker for UI purposes only
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('sessionExpiry', expiryDate.toISOString());
        
        toast.success("Login successful!");
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          localStorage.setItem('isAdmin', 'true');
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
