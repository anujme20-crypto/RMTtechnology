import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const WithdrawRecord = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setRecords(data);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Withdraw Records</h1>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="bg-[hsl(var(--navy-medium))] rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Withdraw Status</span>
              <span className={`font-semibold capitalize ${
                record.status === 'success' ? 'text-success' : 
                record.status === 'processing' ? 'text-primary' : 
                'text-muted-foreground'
              }`}>
                {record.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Withdraw Amount</span>
              <span className="font-semibold text-foreground">₹{record.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fee</span>
              <span className="font-semibold text-foreground">₹{record.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount Received</span>
              <span className="font-semibold text-foreground">₹{record.final_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Initiation Time</span>
              <span className="text-xs text-muted-foreground">{new Date(record.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WithdrawRecord;
