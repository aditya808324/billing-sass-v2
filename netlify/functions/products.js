import { getDb } from './utils/db.js';
import { getUserFromEvent } from './utils/auth.js';
import { headers, sendResponse } from './utils/headers.js';

export const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    const user = getUserFromEvent(event);
    if (!user) return sendResponse(401, { error: 'Unauthorized' });

    const pool = getDb();
    const id = event.path.split('/').pop();
    const isIdRequest = id && id !== 'products';

    try {
        if (event.httpMethod === 'GET') {
            if (isIdRequest && id !== 'products') {
                const result = await pool.query(
                    'SELECT * FROM products WHERE id = $1 AND user_id = $2',
                    [id, user.userId]
                );
                if (result.rows.length === 0) return sendResponse(404, { error: 'Product not found' });
                return sendResponse(200, result.rows[0]);
            }

            const result = await pool.query(
                'SELECT * FROM products WHERE user_id = $1 ORDER BY name ASC',
                [user.userId]
            );
            return sendResponse(200, result.rows);
        }

        if (event.httpMethod === 'POST') {
            const { name, category, price, gst_rate } = JSON.parse(event.body);
            if (!name || price === undefined) return sendResponse(400, { error: 'Name and Price required' });

            const result = await pool.query(
                `INSERT INTO products (user_id, name, category, price, gst_rate) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING *`,
                [user.userId, name, category, price, gst_rate || 0]
            );
            return sendResponse(201, result.rows[0]);
        }

        if (event.httpMethod === 'PUT') {
            if (!isIdRequest) return sendResponse(400, { error: 'Product ID required' });

            const { name, category, price, gst_rate } = JSON.parse(event.body);
            const result = await pool.query(
                `UPDATE products 
                  SET name = $1, category = $2, price = $3, gst_rate = $4 
                  WHERE id = $5 AND user_id = $6 
                  RETURNING *`,
                [name, category, price, gst_rate, id, user.userId]
            );

            if (result.rows.length === 0) return sendResponse(404, { error: 'Product not found' });
            return sendResponse(200, result.rows[0]);
        }

        if (event.httpMethod === 'DELETE') {
            if (!isIdRequest) return sendResponse(400, { error: 'Product ID required' });

            const result = await pool.query(
                'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
                [id, user.userId]
            );

            if (result.rows.length === 0) return sendResponse(404, { error: 'Product not found' });
            return sendResponse(200, { message: 'Deleted' });
        }

        return sendResponse(405, { error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Products Error:', error);
        return sendResponse(500, { error: 'Internal Server Error' });
    }
};
