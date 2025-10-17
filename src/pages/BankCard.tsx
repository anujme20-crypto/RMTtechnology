import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const BankCard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bankCard, setBankCard] = useState<any>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    ifscCode: "",
    cardHolderName: "",
    accountNumber: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    const { data: bankData } = await supabase
      .from("bank_cards")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileData) setProfile(profileData);
    if (bankData) {
      setBankCard(bankData);
      setFormData({
        bankName: bankData.bank_name,
        ifscCode: bankData.ifsc_code,
        cardHolderName: bankData.card_holder_name,
        accountNumber: bankData.account_number,
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (bankCard) {
      toast.error("Bank card already saved");
      return;
    }

    await supabase.from("bank_cards").insert({
      user_id: session.user.id,
      bank_name: formData.bankName,
      ifsc_code: formData.ifscCode,
      card_holder_name: formData.cardHolderName,
      account_number: formData.accountNumber,
    });

    toast.success("Bank card saved successfully");
    loadData();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Bank Card Info</h1>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-foreground">Bank Name</Label>
          <Input
            placeholder="Please enter a bank name"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            disabled={!!bankCard}
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">IFSC Code</Label>
          <Input
            placeholder="Please enter IFSC code"
            value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
            disabled={!!bankCard}
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Card Holder Name</Label>
          <Input
            placeholder="Please enter Card Holder name"
            value={formData.cardHolderName}
            onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
            disabled={!!bankCard}
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Bank Account Number</Label>
          <Input
            placeholder="Please enter Bank account number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            disabled={!!bankCard}
            className="bg-[hsl(var(--navy-medium))] border-[hsl(var(--navy-light))] text-foreground"
          />
        </div>

        {!bankCard && (
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Save Bank Card
          </Button>
        )}
      </div>
    </div>
  );
};

export default BankCard;
