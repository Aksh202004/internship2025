-- =============================================
-- SUPABASE DATABASE SCHEMA FOR JEWELRY E-COMMERCE
-- Run this in Supabase SQL Editor (supabase.com -> SQL Editor)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Rings', 'rings', 1),
  ('Earrings', 'earrings', 2),
  ('Necklaces', 'necklaces', 3),
  ('Pendants', 'pendants', 4),
  ('Bracelets', 'bracelets', 5);

-- =============================================
-- 2. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  sku VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL,
  compare_at_price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  
  -- Category
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Inventory
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Metal Details
  metal_type VARCHAR(50),
  metal_purity VARCHAR(20),
  metal_weight DECIMAL(8, 2),
  metal_color VARCHAR(30),
  
  -- Gemstone Details
  gemstone_type VARCHAR(50),
  gemstone_carat DECIMAL(6, 2),
  gemstone_color VARCHAR(30),
  gemstone_clarity VARCHAR(20),
  gemstone_cut VARCHAR(30),
  
  -- Product Details
  gender VARCHAR(20) DEFAULT 'unisex',
  occasion TEXT[],
  size VARCHAR(20),
  
  -- Images (array of paths in Supabase storage)
  images TEXT[],
  thumbnail TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  -- Stats
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer Details (snapshot)
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(200),
  customer_phone VARCHAR(20),
  
  -- Shipping Address
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Order Totals
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  
  -- Coupon
  coupon_code VARCHAR(50),
  coupon_id UUID,
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending',
  payment_status VARCHAR(30) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  
  -- Shipping
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(50),
  product_image TEXT,
  
  -- Pricing
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(12, 2) NOT NULL,
  
  -- Customization
  size VARCHAR(20),
  engraving TEXT,
  gift_wrap BOOLEAN DEFAULT false,
  gift_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. COUPONS TABLE
-- =============================================
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Limits
  minimum_purchase DECIMAL(12, 2) DEFAULT 0,
  maximum_discount DECIMAL(12, 2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  
  -- Validity
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Restrictions
  applicable_categories UUID[],
  applicable_products UUID[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Review Content
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  
  -- Detailed Ratings
  quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Media
  images TEXT[],
  
  -- Verification
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Helpful votes
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. ADMIN USERS TABLE
-- =============================================
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(200),
  role VARCHAR(50) DEFAULT 'admin',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. CART TABLE (for guest carts)
-- =============================================
CREATE TABLE carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. WISHLIST TABLE
-- =============================================
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_coupons_code ON coupons(code);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (is_active = true);

-- Allow all operations for authenticated users (admin)
-- In production, you'd check for admin role
CREATE POLICY "Allow all for authenticated" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON coupons
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- Public can submit reviews
CREATE POLICY "Anyone can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Public can read approved reviews
CREATE POLICY "Approved reviews are public" ON reviews
  FOR SELECT USING (status = 'approved');

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Generate product slug
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_slug BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION generate_product_slug();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Sample Products
INSERT INTO products (name, sku, description, price, compare_at_price, category_id, stock, metal_type, metal_purity, metal_weight, gemstone_type, gemstone_carat, status, is_featured)
SELECT 
  'Diamond Solitaire Ring',
  'RING-DIA-001',
  'Elegant diamond solitaire ring set in 18K white gold. Perfect for engagements or special occasions.',
  125000,
  145000,
  id,
  5,
  'Gold',
  '18K',
  4.5,
  'Diamond',
  1.5,
  'active',
  true
FROM categories WHERE slug = 'rings';

INSERT INTO products (name, sku, description, price, category_id, stock, metal_type, metal_purity, metal_weight, status)
SELECT 
  'Gold Chain Necklace',
  'NECK-GLD-001',
  'Classic 22K gold chain necklace with intricate design. Ideal for daily wear.',
  85000,
  id,
  12,
  'Gold',
  '22K',
  15.0,
  'active'
FROM categories WHERE slug = 'necklaces';

INSERT INTO products (name, sku, description, price, category_id, stock, metal_type, metal_purity, gemstone_type, status, is_new_arrival)
SELECT 
  'Pearl Drop Earrings',
  'EAR-PRL-001',
  'Beautiful South Sea pearl drop earrings in 14K gold setting.',
  32000,
  id,
  3,
  'Gold',
  '14K',
  'South Sea Pearl',
  'active',
  true
FROM categories WHERE slug = 'earrings';

INSERT INTO products (name, sku, description, price, compare_at_price, category_id, stock, metal_type, metal_purity, gemstone_type, gemstone_carat, status, is_bestseller)
SELECT 
  'Ruby Tennis Bracelet',
  'BRAC-RUB-001',
  'Stunning ruby tennis bracelet with 3ct total weight rubies set in 18K rose gold.',
  95000,
  110000,
  id,
  8,
  'Gold',
  '18K Rose',
  'Ruby',
  3.0,
  'active',
  true
FROM categories WHERE slug = 'bracelets';

INSERT INTO products (name, sku, description, price, category_id, stock, metal_type, metal_purity, gemstone_type, gemstone_carat, status)
SELECT 
  'Sapphire Pendant',
  'PEND-SAP-001',
  'Exquisite blue sapphire pendant with diamond halo in 18K white gold.',
  68000,
  id,
  6,
  'Gold',
  '18K White',
  'Blue Sapphire',
  2.0,
  'active'
FROM categories WHERE slug = 'pendants';

-- Sample Coupon
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_purchase, maximum_discount, start_date, end_date, is_active)
VALUES 
  ('WELCOME10', 'Welcome discount - 10% off on first order', 'percentage', 10, 5000, 10000, NOW(), NOW() + INTERVAL '1 year', true),
  ('FLAT5000', 'Flat ₹5000 off on orders above ₹50000', 'fixed', 5000, 50000, NULL, NOW(), NOW() + INTERVAL '6 months', true);

-- Sample Customer
INSERT INTO customers (email, first_name, last_name, phone, city, state, is_active)
VALUES 
  ('priya.sharma@email.com', 'Priya', 'Sharma', '+91 98765 43210', 'Mumbai', 'Maharashtra', true),
  ('rahul.verma@email.com', 'Rahul', 'Verma', '+91 87654 32109', 'Delhi', 'Delhi', true);

SELECT 'Database setup complete! Tables created with sample data.' as message;
