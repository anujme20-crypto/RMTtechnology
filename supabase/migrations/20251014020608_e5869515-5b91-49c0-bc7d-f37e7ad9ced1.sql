-- Add product_type column to products table to distinguish stable products
ALTER TABLE public.products 
ADD COLUMN product_type text NOT NULL DEFAULT 'stable';

-- Add comment to explain the column
COMMENT ON COLUMN public.products.product_type IS 'Type of product: stable or non-stable. Only stable products generate referral commissions.';

-- Add index for better query performance
CREATE INDEX idx_products_product_type ON public.products(product_type);