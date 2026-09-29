import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { Client } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.error("❌ Error: No DATABASE_URL found in server/.env");
    console.log("ℹ️ In your Supabase Dashboard, go to Project Settings -> Database -> Connection String (URI).");
    console.log("   Add it to server/.env as: DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "..", "supabase_schema.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ Error: supabase_schema.sql not found at", sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("⚡ Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase PostgreSQL!");
    console.log("⏳ Executing supabase_schema.sql (creating tables, policies, and seeding canon lore)...");
    
    await client.query(sql);
    
    console.log("🎉 Migration completed successfully!");
    console.log("   - Slayers table created & seeded");
    console.log("   - Missions table created & seeded");
    console.log("   - Squads table created");
    console.log("   - Twelve Kizuki table created & seeded");
    console.log("   - Formation History table created");
    console.log("   - Row Level Security (RLS) policies applied");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
