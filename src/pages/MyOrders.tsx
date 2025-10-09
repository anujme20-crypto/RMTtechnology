import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_products")
      .select("*, products(*)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">My Product</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-lg p-4 border border-border">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{order.products.name}</h3>
                <p className="text-sm text-muted-foreground">Daily Earnings: ₹{order.products.daily_earnings}</p>
                <p className="text-sm text-muted-foreground">Total Revenue: ₹{order.products.total_revenue}</p>
                <p className="text-sm text-muted-foreground">Revenue {order.products.revenue_days} days</p>
                <p className="text-xs text-muted-foreground mt-2">Purchased: {new Date(order.purchase_date).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">Expires: {new Date(order.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
