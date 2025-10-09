-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mobile_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  trade_password TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  invited_by TEXT,
  recharge_balance DECIMAL(10,2) DEFAULT 20.00,
  withdrawal_balance DECIMAL(10,2) DEFAULT 0.00,
  product_income DECIMAL(10,2) DEFAULT 0.00,
  total_commission DECIMAL(10,2) DEFAULT 0.00,
  spin_chances INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bank cards table
CREATE TABLE public.bank_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bank_name TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'stable', 'welfare', 'activity'
  vip_level INTEGER NOT NULL,
  name TEXT NOT NULL,
  daily_earnings DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  revenue_days INTEGER NOT NULL,
  maximum_purchase INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user products table (purchases)
CREATE TABLE public.user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  days_remaining INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL, -- 'recharge', 'withdraw', 'product_buy', 'income', 'reward', 'commission', 'spin', 'checkin', 'blog_reward'
  amount DECIMAL(10,2) NOT NULL,
  balance_type TEXT NOT NULL, -- 'recharge', 'withdrawal', 'product_income'
  status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'processing', 'success'
  utr_number TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recharge requests table
CREATE TABLE public.recharge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  upi_id TEXT NOT NULL,
  utr_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'under_review', -- 'under_review', 'processing', 'success'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create prizes table (spin rewards)
CREATE TABLE public.prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_amount DECIMAL(10,2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer support messages table
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recharge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bank cards
CREATE POLICY "Users can view own bank card" ON public.bank_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank card" ON public.bank_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank card" ON public.bank_cards FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for products (readable by all authenticated users)
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);

-- RLS Policies for user products
CREATE POLICY "Users can view own products" ON public.user_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.user_products FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for recharge requests
CREATE POLICY "Users can view own recharge requests" ON public.recharge_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recharge requests" ON public.recharge_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for withdrawal requests
CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawal requests" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for prizes
CREATE POLICY "Users can view own prizes" ON public.prizes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prizes" ON public.prizes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for blog posts (viewable by all, insertable by owner)
CREATE POLICY "All users can view blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own blog posts" ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support messages
CREATE POLICY "Users can view own support messages" ON public.support_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own support messages" ON public.support_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert initial products
INSERT INTO public.products (category, vip_level, name, daily_earnings, total_revenue, revenue_days, maximum_purchase, price) VALUES
-- Stable Products
('stable', 1, 'VIP 1', 290.00, 14085.00, 47, 10, 390.00),
('stable', 2, 'VIP 2', 3911.40, 183835.80, 47, 10, 4770.00),
('stable', 3, 'VIP 3', 9769.10, 459147.70, 47, 10, 11770.00),
('stable', 4, 'VIP 4', 19126.80, 898959.60, 47, 10, 22770.00),
('stable', 5, 'VIP 5', 38054.50, 1788561.50, 47, 10, 44770.00),
('stable', 6, 'VIP 6', 47962.20, 2254223.40, 47, 10, 55770.00),
-- Welfare Products
('welfare', 1, 'VIP 1 Benefits (1 Day)', 300.00, 300.00, 1, 1, 200.00),
('welfare', 1, 'VIP 1 Benefits (3 Days)', 80.00, 240.00, 3, 1, 150.00),
('welfare', 2, 'VIP 2 Benefits', 1500.00, 1500.00, 1, 1, 500.00),
('welfare', 3, 'VIP 3 Benefits', 7500.00, 7500.00, 1, 1, 1500.00),
('welfare', 4, 'VIP 4 Benefits', 12000.00, 12000.00, 1, 1, 3000.00),
('welfare', 5, 'VIP 5 Benefits', 30000.00, 30000.00, 1, 1, 6000.00),
-- Activity Products
('activity', 1, 'VIP 1 Activity', 994.00, 46741.00, 47, 10, 1170.00),
('activity', 2, 'VIP 2 Activity', 1887.90, 88731.00, 47, 10, 2170.00),
('activity', 3, 'VIP 3 Activity', 3711.00, 174431.00, 47, 10, 4170.00);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();