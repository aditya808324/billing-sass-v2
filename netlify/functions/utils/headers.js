export const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export const sendResponse = (statusCode, body) => {
    return {
        statusCode,
        headers,
        body: JSON.stringify(body)
    };
};
