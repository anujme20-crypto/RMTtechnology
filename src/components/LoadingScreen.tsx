import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 100);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0a1628] flex flex-col items-center justify-center z-50">
      <img src={logo} alt="Logo" className="w-32 h-32 mb-8 animate-pulse" />
      <div className="w-64 h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/60 mt-4 text-sm">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
