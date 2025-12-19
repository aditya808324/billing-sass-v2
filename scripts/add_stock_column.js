import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const addStockColumn = async () => {
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

        console.log("🚀 Adding 'stock' column to 'products' table...");
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
                    ALTER TABLE products ADD COLUMN stock NUMERIC(10,2) DEFAULT 0;
                END IF;
            END $$;
        `);
        console.log("✅ Column 'stock' ensured in 'products' table.");

    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await client.end();
    }
};

addStockColumn();
