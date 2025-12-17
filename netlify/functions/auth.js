import bcrypt from 'bcryptjs';
import { getDb } from './utils/db.js';
import { signToken, getUserFromEvent } from './utils/auth.js';
import { headers, sendResponse } from './utils/headers.js';

export const handler = async (event, context) => {
    // Handle OPTIONS for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const pool = getDb();

    // Parse segment properly
    // Note: Netlify Dev vs Production path handling might differ.
    // Let's deduce action from body if possible or path.
    // Path example: /.netlify/functions/auth/signup
    const segment = event.path.split('/').pop();

    try {
        if (event.httpMethod === 'POST' && segment === 'signup') {
            const { email, password, businessName } = JSON.parse(event.body);

            if (!email || !password) {
                return sendResponse(400, { error: 'Email and password are required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            try {
                const result = await pool.query(
                    `INSERT INTO users (email, password_hash, business_name) 
                     VALUES ($1, $2, $3) 
                     RETURNING id, email, business_name`,
                    [email, hashedPassword, businessName]
                );

                const user = result.rows[0];
                const token = signToken({ userId: user.id, email: user.email });

                return sendResponse(201, { user, token });
            } catch (err) {
                if (err.code === '23505') { // Unique violation
                    return sendResponse(409, { error: 'Email already exists' });
                }
                throw err;
            }
        }

        if (event.httpMethod === 'POST' && segment === 'login') {
            const { email, password } = JSON.parse(event.body);

            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return sendResponse(401, { error: 'Invalid credentials' });
            }

            const token = signToken({ userId: user.id, email: user.email });
            delete user.password_hash;

            return sendResponse(200, { user, token });
        }

        if (event.httpMethod === 'GET' && segment === 'me') {
            const userPayload = getUserFromEvent(event);
            if (!userPayload) return sendResponse(401, { error: 'Unauthorized' });

            const result = await pool.query('SELECT * FROM users WHERE id = $1', [userPayload.userId]);
            const user = result.rows[0];

            if (!user) return sendResponse(404, { error: 'User not found' });
            delete user.password_hash;

            return sendResponse(200, { user });
        }

        if (event.httpMethod === 'PUT' && segment === 'profile') {
            const userPayload = getUserFromEvent(event);
            if (!userPayload) return sendResponse(401, { error: 'Unauthorized' });

            const data = JSON.parse(event.body);
            const { business_name, business_address, business_phone, business_email, gst_number, logo_url, invoice_prefix } = data;

            const result = await pool.query(
                `UPDATE users 
                  SET business_name = $1, business_address = $2, business_phone = $3, 
                      business_email = $4, gst_number = $5, logo_url = $6, invoice_prefix = $7, updated_at = NOW()
                  WHERE id = $8
                  RETURNING *`,
                [business_name, business_address, business_phone, business_email, gst_number, logo_url, invoice_prefix, userPayload.userId]
            );

            const user = result.rows[0];
            delete user.password_hash;
            return sendResponse(200, { user });
        }

        return sendResponse(404, { error: 'Not Found', path: event.path });

    } catch (error) {
        console.error('Auth Error:', error);
        return sendResponse(500, { error: 'Internal Server Error', details: error.message });
    }
};
