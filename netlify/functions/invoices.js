import { getDb } from './utils/db.js';
import { getUserFromEvent } from './utils/auth.js';
import { headers, sendResponse } from './utils/headers.js';

export const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    const user = getUserFromEvent(event);
    if (!user) return sendResponse(401, { error: 'Unauthorized' });

    const pool = getDb();

    try {
        if (event.httpMethod === 'GET') {
            const { search } = event.queryStringParameters || {};
            let query = 'SELECT * FROM invoices WHERE user_id = $1';
            let params = [user.userId];

            if (search) {
                query += ' AND (invoice_number ILIKE $2 OR customer_snapshot->>\'name\' ILIKE $2)';
                params.push(`%${search}%`);
            }

            query += ' ORDER BY created_at DESC LIMIT 50';

            const result = await pool.query(query, params);
            return sendResponse(200, result.rows);
        }

        if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);

            const countRes = await pool.query('SELECT count(*) FROM invoices WHERE user_id = $1', [user.userId]);
            const nextNum = parseInt(countRes.rows[0].count) + 1;

            const userRes = await pool.query('SELECT invoice_prefix FROM users WHERE id = $1', [user.userId]);
            const prefix = userRes.rows[0].invoice_prefix || 'INV-';
            const invoiceNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;

            const result = await pool.query(
                `INSERT INTO invoices (
                    user_id, invoice_number, customer_id, customer_snapshot, 
                    items_snapshot, subtotal, tax_total, discount_total, grand_total, payment_method, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *`,
                [
                    user.userId,
                    invoiceNumber,
                    data.customerId || null,
                    JSON.stringify(data.customerDetails || {}),
                    JSON.stringify(data.items || []),
                    data.subtotal,
                    data.taxTotal,
                    data.discountTotal || 0,
                    data.grandTotal,
                    data.paymentMethod || 'CASH',
                    data.notes
                ]
            );
            return sendResponse(201, result.rows[0]);
        }

        return sendResponse(405, { error: 'Method Not Allowed' });

    } catch (error) {
        console.error('Invoices Error:', error);
        return sendResponse(500, { error: 'Internal Server Error' });
    }
};
