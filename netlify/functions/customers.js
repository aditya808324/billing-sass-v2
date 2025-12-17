import { getDb } from './utils/db.js';
import { getUserFromEvent } from './utils/auth.js';
import { headers, sendResponse } from './utils/headers.js';

export const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    const user = getUserFromEvent(event);
    if (!user) return sendResponse(401, { error: 'Unauthorized' });

    const pool = getDb();
    const id = event.path.split('/').pop();
    const isIdRequest = id && id !== 'customers';

    try {
        if (event.httpMethod === 'GET') {
            const { search } = event.queryStringParameters || {};
            let query = 'SELECT * FROM customers WHERE user_id = $1';
            let params = [user.userId];

            if (search) {
                query += ' AND (name ILIKE $2 OR phone ILIKE $2)';
                params.push(`%${search}%`);
            }

            query += ' ORDER BY created_at DESC LIMIT 50';

            const result = await pool.query(query, params);
            return sendResponse(200, result.rows);
        }

        if (event.httpMethod === 'POST') {
            const { name, phone, email, address } = JSON.parse(event.body);
            if (!name) return sendResponse(400, { error: 'Name required' });

            const result = await pool.query(
                `INSERT INTO customers (user_id, name, phone, email, address) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING *`,
                [user.userId, name, phone, email, address]
            );
            return sendResponse(201, result.rows[0]);
        }

        return sendResponse(405, { error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Customers Error:', error);
        return sendResponse(500, { error: 'Internal Server Error' });
    }
};
