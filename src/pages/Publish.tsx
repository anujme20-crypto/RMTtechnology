import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const Publish = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePublish = async () => {
    if (!content || !imageFile) {
      toast.error("Please enter content and upload an image");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login first");
        return;
      }

      // Check if user has withdrawn
      const { data: withdrawals } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "success");

      if (!withdrawals || withdrawals.length === 0) {
        toast.error("You must complete a withdrawal before publishing");
        return;
      }

      // Calculate reward based on withdrawal amount
      const lastWithdrawal = withdrawals[withdrawals.length - 1];
      let reward = 0;
      if (lastWithdrawal.amount >= 106 && lastWithdrawal.amount <= 200) {
        reward = Math.floor(Math.random() * (25 - 20 + 1)) + 20;
      } else if (lastWithdrawal.amount >= 200 && lastWithdrawal.amount <= 1000) {
        reward = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
      }

      // Create blog post (simplified - in production, you'd upload image to storage)
      const { error: blogError } = await supabase
        .from("blog_posts")
        .insert({
          user_id: session.user.id,
          image_url: URL.createObjectURL(imageFile),
          reward_amount: reward,
        });

      if (blogError) throw blogError;

      // Add reward to withdrawal balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("withdrawal_balance")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            withdrawal_balance: profile.withdrawal_balance + reward
          })
          .eq("user_id", session.user.id);

        await supabase.from("transactions").insert({
          user_id: session.user.id,
          transaction_type: "reward",
          amount: reward,
          balance_type: "withdrawal",
          description: "Blog post reward",
        });
      }

      toast.success(`Post published! You earned ₹${reward}`);
      navigate("/blog");
    } catch (error) {
      toast.error("Failed to publish post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Post Blog</h1>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            placeholder="Please enter the content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <Button
          onClick={handlePublish}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-primary to-accent"
        >
          {uploading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
};

export default Publish;
