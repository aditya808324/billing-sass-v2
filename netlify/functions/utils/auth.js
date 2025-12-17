import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';

export const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export const getUserFromEvent = (event) => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    return verifyToken(token);
};
