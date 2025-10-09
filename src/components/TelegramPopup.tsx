import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface TelegramPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TelegramPopup = ({ open, onOpenChange }: TelegramPopupProps) => {
  const handleFollow = () => {
    toast.info("Work is underway on this", { duration: 2000 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Follow Telegram</h2>
        </DialogTitle>
        <p className="text-center text-muted-foreground mb-4">
          Follow the official channel to get the latest offers
        </p>
        <div className="flex gap-3">
          <Button onClick={handleFollow} className="flex-1 bg-gradient-to-r from-primary to-accent">
            Follow Now
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
