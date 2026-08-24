import mysql from "mysql2/promise";

async function check() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "amenuverse",
    });

    const [rows] = await connection.execute("SELECT * FROM promotions");
    console.log("=== MYSQL PROMOTIONS TABLE ROWS ===");
    console.log(JSON.stringify(rows, null, 2));

    const [restaurants] = await connection.execute("SELECT id, name, slug FROM restaurants");
    console.log("=== MYSQL RESTAURANTS TABLE ROWS ===");
    console.log(JSON.stringify(restaurants, null, 2));

    const [branches] = await connection.execute("SELECT id, name, restaurant_id FROM branches");
    console.log("=== MYSQL BRANCHES TABLE ROWS ===");
    console.log(JSON.stringify(branches, null, 2));
  } catch (e) {
    console.error("DB Query error:", e);
  } finally {
    if (connection) await connection.end();
  }
}

check();
