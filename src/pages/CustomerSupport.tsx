import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";

const CustomerSupport = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-[hsl(var(--navy-dark))] flex flex-col">
      <div className="bg-[hsl(var(--navy-medium))] p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground hover:bg-[hsl(var(--navy-light))]">
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Help Center</h1>
      </div>

      <div className="flex-1 p-4 bg-gray-100">
        <div className="bg-blue-500 rounded-lg p-4 mb-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">TCS Customer Service</p>
              <p className="text-xs text-white/90 mb-2">Contact us</p>
              <p className="text-sm text-white bg-white/10 rounded-lg p-3">
                Hello!<br/>
                We're happy to assist you. Please describe your inquiry in detail using English. Our support team will respond as soon as they see your message!<br/>
                ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[hsl(var(--navy-medium))] flex gap-2 bg-white">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-white border-gray-300"
        />
        <Button size="icon" className="bg-blue-500 hover:bg-blue-600">
          <Send className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default CustomerSupport;
