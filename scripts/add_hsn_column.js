import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addHSNColumn = async () => {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set.");
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("✅ Connected to database.");

        console.log("🚀 Adding 'hsn_code' column to 'products' table...");
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='hsn_code') THEN
                    ALTER TABLE products ADD COLUMN hsn_code TEXT;
                END IF;
            END $$;
        `);
        console.log("✅ Column 'hsn_code' ensured in 'products' table.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await client.end();
    }
};

addHSNColumn();
