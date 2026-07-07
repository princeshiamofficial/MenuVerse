CREATE DATABASE IF NOT EXISTS digital_food_menu;
USE digital_food_menu;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS branch_tables;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS restaurants;
SET FOREIGN_KEY_CHECKS = 1;

-- Tenants Table
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(255),
  rating VARCHAR(50),
  reviews VARCHAR(50),
  price VARCHAR(50),
  time VARCHAR(50),
  location VARCHAR(255),
  logo VARCHAR(50),
  logo_bg VARCHAR(255),
  image VARCHAR(512),
  logo_image VARCHAR(512),
  username VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(50),
  operating_hours VARCHAR(255),
  facilities VARCHAR(512),
  intro_text TEXT,
  description_text TEXT,
  primary_color VARCHAR(50) DEFAULT '#ff7a00',
  font_family VARCHAR(50) DEFAULT 'Outfit',
  layout_type VARCHAR(50) DEFAULT 'grid',
  offer_slides TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches for each Restaurant
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(100) PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(50),
  operating_hours VARCHAR(255),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Tables inside each Branch
CREATE TABLE IF NOT EXISTS branch_tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Menu Items for each Restaurant
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(512),
  category VARCHAR(100) NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Staff / Admins
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NULL, -- NULL represents a global admin
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'staff'
  assigned_branch_id VARCHAR(100) NULL,
  avatar VARCHAR(512) NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  restaurant_id INT NOT NULL,
  branch_id VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  items JSON NOT NULL, -- array of objects: [{"id": 1, "name": "Burger", "quantity": 2, "price": 8.5}]
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
