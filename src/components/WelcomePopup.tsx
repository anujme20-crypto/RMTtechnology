import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface WelcomePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomePopup = ({ open, onOpenChange }: WelcomePopupProps) => {
  const handleFollow = () => {
    window.open("https://t.me/Technology_Helper", "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] border-none p-8 max-w-sm rounded-3xl">
        <DialogTitle className="text-3xl font-bold text-white text-center">Official Channel</DialogTitle>
        
        <div className="text-center space-y-6 mt-4">
          <p className="text-white text-base leading-relaxed">
            Follow our official channel to receive the latest updates, news, and announcements in real-time, and be the first to know about new benefit products!
          </p>
          
          <Button
            onClick={handleFollow}
            className="w-full bg-white text-gray-800 hover:bg-white/90 font-semibold py-6 text-base rounded-2xl flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold">Telegram</div>
                <div className="text-sm text-gray-500">Future Fund Service</div>
              </div>
            </div>
            <span className="text-blue-600">Follow &gt;</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};