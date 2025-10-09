import { useNavigate, useLocation } from "react-router-dom";
import { Home, TrendingUp, Bell, FileText, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Invest", path: "/invest" },
    { icon: Bell, label: "Notice", path: "/notice" },
    { icon: FileText, label: "Blog", path: "/blog" },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e3a5f] border-t border-[#2d4a6f] py-2 px-4 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-500" : "text-white/60"
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-blue-500 font-medium" : "text-white/60"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
