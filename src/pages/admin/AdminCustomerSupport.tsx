import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

interface UserMessages {
  mobile_number: string;
  messages: Message[];
}

const AdminCustomerSupport = () => {
  const navigate = useNavigate();
  const [userMessages, setUserMessages] = useState<UserMessages[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Access denied. Admin only.");
        navigate("/");
        return;
      }

      setIsVerifying(false);
      fetchMessages();
    };

    verifyAdmin();
  }, [navigate]);

  const fetchMessages = async () => {
    const { data: messages } = await supabase
      .from("support_messages")
      .select("*, profiles!inner(mobile_number)")
      .order("created_at", { ascending: false });

    if (messages) {
      const grouped = messages.reduce((acc: any, msg: any) => {
        const mobile = msg.profiles.mobile_number;
        if (!acc[mobile]) {
          acc[mobile] = { mobile_number: mobile, messages: [] };
        }
        acc[mobile].messages.push(msg);
        return acc;
      }, {});
      setUserMessages(Object.values(grouped));
    }
  };

  const sendReply = async () => {
    if (!selectedUser || !replyMessage.trim()) return;

    const userMsg = userMessages.find(u => u.mobile_number === selectedUser);
    if (!userMsg) return;

    const { error } = await supabase.from("support_messages").insert({
      user_id: userMsg.messages[0].user_id,
      message: replyMessage,
      sender_type: "admin",
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent");
      setReplyMessage("");
      fetchMessages();
    }
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
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Customer Support Messages</h1>
      </div>

      {!selectedUser ? (
        <div className="space-y-4">
          {userMessages.map((user) => (
            <Button
              key={user.mobile_number}
              onClick={() => setSelectedUser(user.mobile_number)}
              className="w-full justify-start h-auto p-4"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-semibold">{user.mobile_number}</div>
                <div className="text-sm text-muted-foreground">
                  {user.messages.length} messages
                </div>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div>
          <Button onClick={() => setSelectedUser(null)} variant="outline" className="mb-4">
            Back to Users
          </Button>
          
          <div className="space-y-4 mb-4">
            {userMessages
              .find(u => u.mobile_number === selectedUser)
              ?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.sender_type === "user" ? "bg-card ml-0 mr-12" : "bg-primary/10 ml-12 mr-0"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {msg.sender_type === "user" ? selectedUser : "Admin"}
                  </div>
                  <div>{msg.message}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              onKeyPress={(e) => e.key === "Enter" && sendReply()}
            />
            <Button onClick={sendReply}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerSupport;
