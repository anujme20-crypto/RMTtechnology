import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminHome from "./pages/admin/AdminHome";
import AdminCustomerSupport from "./pages/admin/AdminCustomerSupport";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWithdrawOrders from "./pages/admin/AdminWithdrawOrders";
import AdminRechargeRecord from "./pages/admin/AdminRechargeRecord";
import AdminSystemBonus from "./pages/admin/AdminSystemBonus";
import LuckyDraw from "./pages/LuckyDraw";
import MyPrizes from "./pages/MyPrizes";
import Invest from "./pages/Invest";
import InvestNow from "./pages/InvestNow";
import Recharge from "./pages/Recharge";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Team from "./pages/Team";
import MyOrders from "./pages/MyOrders";
import BankCard from "./pages/BankCard";
import Balance from "./pages/Balance";
import RechargeRecord from "./pages/RechargeRecord";
import WithdrawRecord from "./pages/WithdrawRecord";
import CustomerSupport from "./pages/CustomerSupport";
import Account from "./pages/Account";
import Notice from "./pages/Notice";
import Blog from "./pages/Blog";
import Publish from "./pages/Publish";
import Vip from "./pages/Vip";
import TaskReward from "./pages/TaskReward";
import Setting from "./pages/Setting";
import Reward from "./pages/Reward";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/customer-support" element={<AdminCustomerSupport />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/withdraw-orders" element={<AdminWithdrawOrders />} />
          <Route path="/admin/recharge-record" element={<AdminRechargeRecord />} />
          <Route path="/admin/system-bonus" element={<AdminSystemBonus />} />
          <Route path="/lucky-draw" element={<LuckyDraw />} />
          <Route path="/my-prizes" element={<MyPrizes />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/invest/:productId" element={<InvestNow />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/team" element={<Team />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/bank-card" element={<BankCard />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/recharge-record" element={<RechargeRecord />} />
          <Route path="/withdraw-record" element={<WithdrawRecord />} />
          <Route path="/customer-support" element={<CustomerSupport />} />
          <Route path="/account" element={<Account />} />
          <Route path="/notice" element={<Notice />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/vip" element={<Vip />} />
          <Route path="/task-reward" element={<TaskReward />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
