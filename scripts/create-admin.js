/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Helper to manually parse .env and .env.local files
function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  let loaded = false;
  envFiles.forEach(file => {
    const envPath = path.join(__dirname, '..', file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const cleanLine = line.trim();
        const match = cleanLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || '').trim();
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value.trim();
        }
      });
      console.log(`Loaded configurations from ${file}`);
      loaded = true;
    }
  });
}

loadEnv();

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'digital_food_menu';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  console.log(`Connecting to database: ${MYSQL_DATABASE}...`);
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  });

  try {
    // 1. Create a default Restaurant first so the admin has a tenant
    console.log('Creating default Sakura Sushi Bar restaurant...');
    const [restaurantResult] = await connection.query(
      `INSERT INTO restaurants (name, cuisine, rating, reviews, price, time, location, logo, logo_bg, username, primary_color, font_family, layout_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [
        'Sakura Sushi Bar',
        'Japanese & Sushi',
        '4.8',
        '120',
        '$$$',
        '20-30 min',
        'Banani, Dhaka',
        'S',
        'from-pink-500 to-rose-600',
        'sakurasushibar',
        '#e11d48',
        'Outfit',
        'grid'
      ]
    );

    const restaurantId = restaurantResult.insertId;
    console.log(`- Restaurant created/verified with ID: ${restaurantId}`);

    // Create a default branch
    console.log('Creating default branch...');
    await connection.query(
      `INSERT INTO branches (id, restaurant_id, name, location, phone, operating_hours)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id=id`,
      [
        'banani-branch',
        restaurantId,
        'Banani Main Branch',
        'Road 11, Banani, Dhaka',
        '+8801700000000',
        'Open Daily: 12:00 PM - 10:30 PM'
      ]
    );
    console.log('- Default branch created/verified.');

    // 2. Create the Admin User
    const email = 'admin@example.com';
    const password = 'password123';
    const hashedPassword = await hashPassword(password);

    console.log(`Creating Admin User: ${email} ...`);
    await connection.query(
      `INSERT INTO users (restaurant_id, name, email, password_hash, role, assigned_branch_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=email`,
      [
        restaurantId,
        'System Admin',
        email,
        hashedPassword,
        'admin',
        null,
        'Active'
      ]
    );

    console.log(`\n✅ Default admin user successfully created!`);
    console.log(`-----------------------------------------------`);
    console.log(`Login Email:    ${email}`);
    console.log(`Login Password: ${password}`);
    console.log(`Restaurant URL:  https://menuversebd.com/sakurasushibar`);
    console.log(`-----------------------------------------------`);

  } catch (err) {
    console.error('Error bootstrapping admin user:', err);
  } finally {
    await connection.end();
  }
}

main();
