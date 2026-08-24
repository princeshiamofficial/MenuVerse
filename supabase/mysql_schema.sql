-- =========================================================
-- MenuVerse MySQL Schema DDL
-- =========================================================

CREATE DATABASE IF NOT EXISTS menuverse;
USE menuverse;

-- Set foreign key checks off to allow clean drops if needed
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS design_requests;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS qr_codes;
DROP TABLE IF EXISTS menu_versions;
DROP TABLE IF EXISTS food_images;
DROP TABLE IF EXISTS food_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- USERS (replaces auth.users + public.profiles)
-- =========================================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- SESSIONS
-- =========================================================
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- USER ROLES
-- =========================================================
CREATE TABLE user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('super_admin', 'owner', 'manager', 'staff', 'customer') NOT NULL,
  restaurant_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, role, restaurant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- RESTAURANTS
-- =========================================================
CREATE TABLE restaurants (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  logo_url VARCHAR(255),
  cover_url VARCHAR(255),
  cuisine VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- BRANCHES
-- =========================================================
CREATE TABLE branches (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  manager VARCHAR(255),
  status ENUM('open', 'closed', 'temporarily_closed') NOT NULL DEFAULT 'open',
  is_default BOOLEAN NOT NULL DEFAULT false,
  menu_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- =========================================================
-- FOOD ITEMS
-- =========================================================
CREATE TABLE food_items (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  category_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  compare_at_price DECIMAL(10,2),
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags JSON,
  calories INT,
  prep_time_minutes INT,
  sort_order INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  order_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =========================================================
-- FOOD IMAGES
-- =========================================================
CREATE TABLE food_images (
  id VARCHAR(36) PRIMARY KEY,
  food_item_id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- =========================================================
-- MENU VERSIONS
-- =========================================================
CREATE TABLE menu_versions (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  version_number INT NOT NULL,
  label VARCHAR(255),
  snapshot JSON,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- QR CODES
-- =========================================================
CREATE TABLE qr_codes (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  code VARCHAR(255) NOT NULL UNIQUE,
  label VARCHAR(255),
  table_number VARCHAR(50),
  target_url TEXT,
  scan_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  customer_id VARCHAR(36),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  table_number VARCHAR(50),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- ORDER ITEMS
-- =========================================================
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  food_item_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL
);

-- =========================================================
-- FEEDBACK
-- =========================================================
CREATE TABLE feedback (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  order_id VARCHAR(36),
  customer_id VARCHAR(36),
  customer_name VARCHAR(255),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- FAVORITES
-- =========================================================
CREATE TABLE favorites (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  food_item_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, food_item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  plan ENUM('free', 'starter', 'business', 'enterprise') NOT NULL DEFAULT 'free',
  status ENUM('trialing', 'active', 'past_due', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  current_period_start TIMESTAMP NULL DEFAULT NULL,
  current_period_end TIMESTAMP NULL DEFAULT NULL,
  cancel_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =========================================================
-- PAYMENTS
-- =========================================================
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  subscription_id VARCHAR(36),
  order_id VARCHAR(36),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  provider VARCHAR(255),
  provider_reference VARCHAR(255),
  invoice_number VARCHAR(255),
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36),
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSON,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =========================================================
-- DESIGN REQUESTS (Color Hut)
-- =========================================================
CREATE TABLE design_requests (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36),
  requested_by VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'draft',
  upload_url VARCHAR(255),
  preview_url VARCHAR(255),
  print_pdf_url VARCHAR(255),
  comments JSON,
  versions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- ANALYTICS EVENTS
-- =========================================================
CREATE TABLE analytics_events (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36),
  branch_id VARCHAR(36),
  event_type VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255),
  entity_id VARCHAR(36),
  user_id VARCHAR(36),
  session_id VARCHAR(255),
  device_type VARCHAR(255),
  country VARCHAR(255),
  language VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================
CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36),
  user_id VARCHAR(36),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255),
  entity_id VARCHAR(36),
  metadata JSON,
  ip_address VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- SETTINGS
-- =========================================================
CREATE TABLE settings (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL UNIQUE,
  theme JSON,
  language VARCHAR(50) NOT NULL DEFAULT 'en',
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tax_inclusive BOOLEAN NOT NULL DEFAULT false,
  service_charge DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  service_charge_enabled BOOLEAN NOT NULL DEFAULT false,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  free_delivery_threshold DECIMAL(10,2),
  notifications JSON,
  email_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- =========================================================
-- Helpful Indexes
-- =========================================================
CREATE INDEX idx_branches_restaurant ON branches(restaurant_id);
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_food_items_restaurant ON food_items(restaurant_id);
CREATE INDEX idx_food_items_category ON food_items(category_id);
CREATE INDEX idx_food_images_item ON food_images(food_item_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_feedback_restaurant ON feedback(restaurant_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_analytics_restaurant ON analytics_events(restaurant_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_activity_logs_restaurant ON activity_logs(restaurant_id);
CREATE INDEX idx_qr_codes_restaurant ON qr_codes(restaurant_id);
CREATE INDEX idx_subscriptions_restaurant ON subscriptions(restaurant_id);
CREATE INDEX idx_payments_restaurant ON payments(restaurant_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- =========================================================
-- DEMO LOGIN CREDENTIALS SEED DATA
-- =========================================================
INSERT INTO users (id, email, password_hash, full_name, phone) VALUES
  ('u-demo-admin', 'admin@menuverse.app', 'fcb785b88bf4b058c82fb17de9526e96:76c88c908e5776e8f47394e3f1872ac296be2103dbb45d5dd2fb97343ebb3d226cf408e9a2fb7b872a3cd1ab6c5b61d6f06bb16036670678a882495efa96e0c6', 'System Super Admin', '+1 (555) 019-9001'),
  ('u-demo-owner', 'owner@menuverse.app', '7328c5f133df599595b341a44b514293:b3d6e2b29f7d4c0e541f3650ec1bc7ffd5cb5f24445f5aef4adac6b26a6a0e3c0daf7d35a24720da03928337ecfc1b84b92101818816f44f2f74295000775969', 'Tariqul Islam (Owner)', '+1 (555) 019-9002'),
  ('u-demo-manager', 'manager@menuverse.app', '6dbf0d5d3134ee0010cf7871942b268c:e491c4dba14a093c5e90aeb5fc10f916f21e3ff403207df7ff9af14c3c17fecfd3eaa830a31aff4f658c06ede9014f5f5ea0ddd51e24c6710f682d187bad0456', 'Sabrina Rahman (Manager)', '+1 (555) 019-9003'),
  ('u-demo-kitchen', 'kitchen@menuverse.app', '373041cd5e68d12dd82c22aa764c0bec:ab2844d6c90b8325839f4e60c18c9c5c67842f32a5aa770092b51d123514009cd6585f932fabfe661cdf4d96c1a4011a6164052fb188d80c1f8f11c8b1dd66c3', 'Head Chef Cheful', '+1 (555) 019-9004'),
  ('u-demo-waiter', 'waiter@menuverse.app', '65ffef6473c05cb928dcb37fc9234853:5f36803d400872e92ae86af4af0352a055af6a7194c2ebdbabc8e982cadd9b5efc074d01ddbb66000b2014955f414811fffa599fabbb81a2f4eb705f7f5a9aa4', 'Rakib Hassan (Waiter)', '+1 (555) 019-9005'),
  ('u-demo-customer', 'customer@menuverse.app', '6c94524042194b5ac3826dacd163c877:556d851d88e2c341454aba941ba042dc2e690536d2e2261b57812f1166cea5e9005f3d3a18a564de66cc83f1c80526fdaed33be30c03e1ba364f593e5ba76d38', 'Amelia Roberts (Customer)', '+1 (555) 019-9006')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO user_roles (id, user_id, role) VALUES
  ('ur-demo-admin', 'u-demo-admin', 'super_admin'),
  ('ur-demo-owner', 'u-demo-owner', 'owner'),
  ('ur-demo-manager', 'u-demo-manager', 'manager'),
  ('ur-demo-kitchen', 'u-demo-kitchen', 'staff'),
  ('ur-demo-waiter', 'u-demo-waiter', 'staff'),
  ('ur-demo-customer', 'u-demo-customer', 'customer')
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- =========================================================
-- WAITER REQUESTS
-- =========================================================
CREATE TABLE IF NOT EXISTS waiter_requests (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id INT NOT NULL DEFAULT 1,
  branch_id VARCHAR(100),
  table_no VARCHAR(50) NOT NULL,
  type ENUM('call','water','bill','custom') DEFAULT 'call',
  note TEXT,
  status ENUM('pending','acknowledged','done') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurant_status (restaurant_id, status),
  INDEX idx_table (restaurant_id, table_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

