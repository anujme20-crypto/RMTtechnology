import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RulePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RulePopup = ({ open, onOpenChange }: RulePopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center font-bold text-xl">
          Reward Description
        </DialogTitle>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Share a screenshot of your case</p>
          <p className="font-semibold">Withdrawal to receive a cash reward</p>
          <p className="text-muted-foreground">
            Upload the latest successfully cash withdrawal screenshot into the comment, 
            and once approved, you will immediately receive a reward of 10-400
          </p>
        </div>
        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};
