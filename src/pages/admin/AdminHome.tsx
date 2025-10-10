import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, ArrowDownToLine, CreditCard, Gift, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUploadPopup } from "@/components/admin/ImageUploadPopup";

const AdminHome = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      // Check localStorage admin marker first (faster check)
      const isAdminStored = localStorage.getItem('isAdmin') === 'true';
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      // If admin marker exists, skip database check for faster access
      if (isAdminStored) {
        setIsVerifying(false);
        return;
      }

      // Otherwise verify from database
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        localStorage.setItem('isAdmin', 'true');
        setIsVerifying(false);
      } else {
        toast.error("Access denied. Admin only.");
        navigate("/");
      }
    };

    verifyAdmin();
  }, [navigate]);

  const handleImageSubmit = (imageFile: File) => {
    // Handle the uploaded image here
    toast.success(`Image uploaded: ${imageFile.name}`);
    // Add your logic here (e.g., upload to storage, save to database)
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Verifying access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Admin Panel
      </h1>
      
      <div className="max-w-2xl mx-auto space-y-4">
        <Button
          onClick={() => navigate("/admin/customer-support")}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <MessageSquare className="mr-2 h-6 w-6" />
          Admin to Customer Support
        </Button>

        <Button
          onClick={() => navigate("/admin/users")}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <Users className="mr-2 h-6 w-6" />
          Users
        </Button>

        <Button
          onClick={() => navigate("/admin/withdraw-orders")}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <ArrowDownToLine className="mr-2 h-6 w-6" />
          Admin Withdraw Orders
        </Button>

        <Button
          onClick={() => navigate("/admin/recharge-record")}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <CreditCard className="mr-2 h-6 w-6" />
          Admin Recharge Record
        </Button>

        <Button
          onClick={() => navigate("/admin/system-bonus")}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <Gift className="mr-2 h-6 w-6" />
          System Bonus
        </Button>

        <Button
          onClick={() => setShowImageUpload(true)}
          className="w-full h-20 text-lg bg-gradient-to-r from-primary to-accent"
        >
          <ImagePlus className="mr-2 h-6 w-6" />
          Upload Image
        </Button>

        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('sessionExpiry');
            navigate("/login");
          }}
          variant="outline"
          className="w-full h-16 text-lg mt-8"
        >
          Logout
        </Button>
      </div>

      <ImageUploadPopup
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onSubmit={handleImageSubmit}
      />
    </div>
  );
};

export default AdminHome;
