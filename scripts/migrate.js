import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set in environment variables.");
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("✅ Connected to Neon PostgreSQL.");

        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("🚀 Running migration...");
        await client.query(schemaSql);
        console.log("✅ Migration completed successfully.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await client.end();
    }
};

runMigration();
