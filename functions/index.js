
const functions = require('firebase-functions');
const axios = require('axios');
const CryptoJS = require('crypto-js');

// Set a timeout for all functions
const runtimeOpts = {
  timeoutSeconds: 30,
  memory: '256MB'
};

exports.gateioProxy = functions.runWith(runtimeOpts).https.onRequest(async (req, res) => {
    // Set CORS headers for preflight and actual requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-Gate-API-Method, X-Gate-API-Endpoint, X-Gate-API-Require-Auth, X-Gate-API-Key, X-Gate-API-Secret');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        const {
            method,
            endpoint,
            params,
            requireAuth,
            apiKey,
            apiSecret
        } = req.body;

        if (!method || !endpoint) {
            return res.status(400).send('"method" and "endpoint" are required in the request body.');
        }
        
        const gateApiUrl = 'https://api.gateio.ws/api/v4';
        let url = `${gateApiUrl}${endpoint}`;
        
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const bodyPayload = (method === 'POST' || method === 'PUT' || method === 'DELETE') && params && Object.keys(params).length > 0 ? JSON.stringify(params) : '';
        let queryString = '';

        if (method === 'GET' && params && Object.keys(params).length > 0) {
            queryString = (new URLSearchParams(params)).toString();
            url += `?${queryString}`;
        }

        if (requireAuth) {
            if (!apiKey || !apiSecret) {
                return res.status(401).send({ message: 'API key and secret are required for authenticated requests.' });
            }
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const hashedPayload = CryptoJS.SHA512(bodyPayload).toString();
            const signString = `${method}\n${endpoint}\n${queryString}\n${hashedPayload}\n${timestamp}`;
            const signature = CryptoJS.HmacSHA512(signString, apiSecret).toString();

            headers['KEY'] = apiKey;
            headers['Timestamp'] = timestamp;
            headers['SIGN'] = signature;
        }
        
        const response = await axios({
            method: method,
            url: url,
            headers: headers,
            data: bodyPayload || undefined,
            timeout: 25000 // 25 seconds timeout
        });

        res.status(200).send(response.data);

    } catch (error) {
        console.error('Error in gateioProxy:', error.message);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            console.error('Error Request (Timeout or Network issue)');
            res.status(504).send({ message: 'No response from Gate.io API (Timeout)' });
        } else {
            res.status(500).send({ message: `Internal Server Error: ${error.message}` });
        }
    }
});
