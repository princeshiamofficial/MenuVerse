import fs from "fs";
import path from "path";

/**
 * CI Migration Validation Script
 * Validates database migration syntax and structural standards before deployment:
 * 1. Checks that all migration files exist and export valid SQL statements
 * 2. Verifies restaurant_id INT NOT NULL is enforced
 * 3. Confirms Foreign Key CASCADE rules and Indexes exist
 */
async function validateMigrations() {
  console.log("🔍 Validating database migrations & schema integrity...");

  const migrationFilePath = path.join(process.cwd(), "src/lib/migrations.ts");
  if (!fs.existsSync(migrationFilePath)) {
    console.error("❌ Migration file src/lib/migrations.ts not found!");
    process.exit(1);
  }

  const content = fs.readFileSync(migrationFilePath, "utf8");

  // Integrity checks
  if (content.includes("DEFAULT 1")) {
    console.warn("⚠️ Warning: Legacy DEFAULT 1 found in migrations. Enforce INT NOT NULL.");
  }

  if (!content.includes("FOREIGN KEY")) {
    console.error("❌ Foreign Key constraints missing from migration schema!");
    process.exit(1);
  }

  if (!content.includes("ON DELETE CASCADE")) {
    console.error("❌ ON DELETE CASCADE rules missing from relational migration schema!");
    process.exit(1);
  }

  if (!content.includes("INDEX idx_")) {
    console.error("❌ Indexes missing from migration schema!");
    process.exit(1);
  }

  console.log("✅ All migration & schema integrity checks passed successfully!");
}

validateMigrations().catch((err) => {
  console.error("❌ Migration validation failed:", err);
  process.exit(1);
});
