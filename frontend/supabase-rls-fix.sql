-- Run this in Supabase SQL Editor to allow public access to tables
-- This disables RLS temporarily for development. Add proper policies for production.

-- Disable RLS on all tables (for development)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- OR if you prefer to keep RLS enabled, add these policies instead:
-- (Comment out the ALTER TABLE lines above and uncomment these)

/*
-- Products: Allow public read, authenticated write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by authenticated users" ON products FOR ALL USING (true);

-- Categories: Allow public read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are editable by authenticated users" ON categories FOR ALL USING (true);

-- Customers: Allow all for now
CREATE POLICY "Customers full access" ON customers FOR ALL USING (true);

-- Orders: Allow all for now
CREATE POLICY "Orders full access" ON orders FOR ALL USING (true);
CREATE POLICY "Order items full access" ON order_items FOR ALL USING (true);

-- Coupons: Allow all for now
CREATE POLICY "Coupons full access" ON coupons FOR ALL USING (true);

-- Reviews: Allow public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews full access" ON reviews FOR ALL USING (true);
*/
