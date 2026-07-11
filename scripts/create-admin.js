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
    // 1. Create all 5 default Restaurants so all public URLs work
    const restaurantsData = [
      {
        name: 'Burger Craft Lab',
        cuisine: 'Gourmet Burgers',
        rating: '4.9',
        reviews: '340',
        price: '$$',
        time: '15-25 min',
        location: 'Dhanmondi, Dhaka',
        logo: 'B',
        logo_bg: 'from-amber-500 to-orange-600',
        username: 'burgercraftlab',
        primary_color: '#ff7a00',
        font_family: 'Outfit',
        layout_type: 'grid',
        branch: {
          id: 'dhanmondi-branch',
          name: 'Dhanmondi Branch',
          location: 'Dhanmondi, Dhaka',
          phone: '+8801919-760626',
          operating_hours: 'Open Daily: 11:00 AM - 11:30 PM'
        }
      },
      {
        name: 'La Dolce Vita',
        cuisine: 'Italian & Pizza',
        rating: '4.7',
        reviews: '180',
        price: '$$$',
        time: '25-35 min',
        location: 'Gulshan, Dhaka',
        logo: 'L',
        logo_bg: 'from-emerald-500 to-teal-600',
        username: 'ladolcevita',
        primary_color: '#10b981',
        font_family: 'Outfit',
        layout_type: 'grid',
        branch: {
          id: 'gulshan-branch',
          name: 'Gulshan Branch',
          location: 'Gulshan, Dhaka',
          phone: '+8801700000001',
          operating_hours: 'Open Daily: 12:00 PM - 11:00 PM'
        }
      },
      {
        name: 'Sakura Sushi Bar',
        cuisine: 'Japanese & Sushi',
        rating: '4.8',
        reviews: '120',
        price: '$$$',
        time: '20-30 min',
        location: 'Banani, Dhaka',
        logo: 'S',
        logo_bg: 'from-pink-500 to-rose-600',
        username: 'sakurasushibar',
        primary_color: '#e11d48',
        font_family: 'Outfit',
        layout_type: 'grid',
        branch: {
          id: 'banani-branch',
          name: 'Banani Main Branch',
          location: 'Road 11, Banani, Dhaka',
          phone: '+8801700000000',
          operating_hours: 'Open Daily: 12:00 PM - 10:30 PM'
        }
      },
      {
        name: 'The Spicy Wok',
        cuisine: 'Pan-Asian & Bowls',
        rating: '4.6',
        reviews: '95',
        price: '$$',
        time: '15-20 min',
        location: 'Uttara, Dhaka',
        logo: 'W',
        logo_bg: 'from-red-500 to-orange-600',
        username: 'spicywok',
        primary_color: '#ef4444',
        font_family: 'Outfit',
        layout_type: 'grid',
        branch: {
          id: 'uttara-branch',
          name: 'Uttara Branch',
          location: 'Uttara, Dhaka',
          phone: '+8801700000002',
          operating_hours: 'Open Daily: 11:30 AM - 10:00 PM'
        }
      },
      {
        name: 'Red Chili',
        cuisine: 'Chinese & Hotpot',
        rating: '4.5',
        reviews: '75',
        price: '$$',
        time: '20-30 min',
        location: 'Mirpur, Dhaka',
        logo: 'R',
        logo_bg: 'from-red-600 to-rose-700',
        username: 'redchili',
        primary_color: '#dc2626',
        font_family: 'Outfit',
        layout_type: 'grid',
        branch: {
          id: 'mirpur-branch',
          name: 'Mirpur Branch',
          location: 'Mirpur, Dhaka',
          phone: '+8801700000003',
          operating_hours: 'Open Daily: 11:30 AM - 10:30 PM'
        }
      }
    ];

    let burgerCraftLabId = 1;

    for (const r of restaurantsData) {
      console.log(`Creating/Verifying restaurant: ${r.name}...`);
      const [res] = await connection.query(
        `INSERT INTO restaurants (name, cuisine, rating, reviews, price, time, location, logo, logo_bg, username, primary_color, font_family, layout_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [r.name, r.cuisine, r.rating, r.reviews, r.price, r.time, r.location, r.logo, r.logo_bg, r.username, r.primary_color, r.font_family, r.layout_type]
      );
      
      const rId = res.insertId || 1;
      if (r.username === 'burgercraftlab') {
        burgerCraftLabId = rId;
      }

      // Create branch
      await connection.query(
        `INSERT INTO branches (id, restaurant_id, name, location, phone, operating_hours)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id=id`,
        [r.branch.id, rId, r.branch.name, r.branch.location, r.branch.phone, r.branch.operating_hours]
      );
    }

    // 2. Create the Admin User (assigned to Burger Craft Lab)
    const email = 'admin@example.com';
    const password = 'password123';
    const hashedPassword = await hashPassword(password);

    console.log(`Creating Admin User: ${email} ...`);
    await connection.query(
      `INSERT INTO users (restaurant_id, name, email, password_hash, role, assigned_branch_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=email`,
      [
        burgerCraftLabId,
        'System Admin',
        email,
        hashedPassword,
        'admin',
        null,
        'Active'
      ]
    );

    console.log(`\n✅ Default admin user and 5 restaurants created!`);
    console.log(`-----------------------------------------------`);
    console.log(`Login Email:    ${email}`);
    console.log(`Login Password: ${password}`);
    console.log(`URLs:`);
    console.log(`  - https://menuversebd.com/burgercraftlab`);
    console.log(`  - https://menuversebd.com/sakurasushibar`);
    console.log(`  - https://menuversebd.com/ladolcevita`);
    console.log(`  - https://menuversebd.com/spicywok`);
    console.log(`  - https://menuversebd.com/redchili`);
    console.log(`-----------------------------------------------`);

  } catch (err) {
    console.error('Error bootstrapping admin user:', err);
  } finally {
    await connection.end();
  }
}

main();
