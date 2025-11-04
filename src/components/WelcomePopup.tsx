import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Shield, Award } from "lucide-react";

interface WelcomePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomePopup = ({ open, onOpenChange }: WelcomePopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border-2 border-purple-500/30 max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full animate-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-3 gradient-text">
              Welcome to Seedworks
            </h2>
            <p className="text-gray-300 mb-6">
              Your Journey to Financial Freedom Starts Here
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 glass-effect rounded-lg p-3 animate-slide-up">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">High Returns</p>
                  <p className="text-gray-400 text-xs">Up to 35% commission</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 glass-effect rounded-lg p-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Secure Platform</p>
                  <p className="text-gray-400 text-xs">Bank-level security</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 glass-effect rounded-lg p-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">VIP Benefits</p>
                  <p className="text-gray-400 text-xs">Exclusive rewards</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Start Investing Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};