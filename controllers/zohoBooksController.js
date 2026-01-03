const pool = require('../config/db');
const crypto = require('crypto');
const axios = require('axios');

// Encryption Helper (Same as SocialMedia)
// Ensure ENCRYPTION_KEY is handled safely
const getEncryptionKey = () => {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY not set');
    }
    return crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest();
};

const encrypt = (text) => {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(16);
        const key = getEncryptionKey();
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

const decrypt = (text) => {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const key = getEncryptionKey();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Check DB Table exists
const checkTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`zoho_books_integrations\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`company_id\` int(11) NOT NULL,
              \`client_id\` varchar(255) NOT NULL,
              \`client_secret\` varchar(255) NOT NULL,
              \`organization_id\` varchar(255) DEFAULT NULL,
              \`access_token\` text,
              \`refresh_token\` text,
              \`token_expiry\` datetime DEFAULT NULL,
              \`status\` enum('Connected','Disconnected','Expired') DEFAULT 'Disconnected',
              \`sync_invoices\` tinyint(1) DEFAULT '1',
              \`sync_payments\` tinyint(1) DEFAULT '1',
              \`sync_customers\` tinyint(1) DEFAULT '0',
              \`last_sync\` datetime DEFAULT NULL,
              \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
              \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`unique_company_zoho\` (\`company_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    } catch (e) {
        console.error("Error ensuring Zoho table:", e);
    }
};
checkTable(); // Run on load

// Get Settings for a Company
const getSettings = async (req, res) => {
    try {
        // Assuming user is authenticated and has company_id
        // For now, defaulting to 1 or taking from query if not in req.user
        const companyId = req.user?.company_id || req.query.company_id || 1;

        const [rows] = await pool.execute(
            'SELECT * FROM zoho_books_integrations WHERE company_id = ?',
            [companyId]
        );

        if (rows.length === 0) {
            return res.json({ success: true, data: null });
        }

        const integration = rows[0];
        // Decrypt sensitive data for display (masked usually, but sending for edit)
        const clientId = integration.client_id ? decrypt(integration.client_id) : '';
        const clientSecret = integration.client_secret ? decrypt(integration.client_secret) : '';
        const orgId = integration.organization_id;

        res.json({
            success: true,
            data: {
                id: integration.id,
                clientId: '•'.repeat(clientId.length), // Masked
                clientSecret: '•'.repeat(clientSecret.length), // Masked
                organizationId: orgId,
                status: integration.status,
                lastSync: integration.last_sync,
                syncInvoices: integration.sync_invoices,
                syncPayments: integration.sync_payments,
                syncCustomers: integration.sync_customers,
                isConfigured: !!(clientId && clientSecret)
            }
        });
    } catch (error) {
        console.error('Get Zoho settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
};

// Update Client ID / Secret
const updateSettings = async (req, res) => {
    try {
        // For safety, assume company 1 if dev
        const companyId = req.user?.company_id || req.body.company_id || 1;
        const { clientId, clientSecret, organizationId } = req.body;

        if (!clientId || !clientSecret) {
            return res.status(400).json({ success: false, error: 'Client ID and Secret are required' });
        }

        const encClientId = encrypt(clientId.trim());
        const encClientSecret = encrypt(clientSecret.trim());

        // Upsert
        await pool.execute(
            `INSERT INTO zoho_books_integrations 
       (company_id, client_id, client_secret, organization_id, status) 
       VALUES (?, ?, ?, ?, 'Disconnected')
       ON DUPLICATE KEY UPDATE 
       client_id = VALUES(client_id), 
       client_secret = VALUES(client_secret),
       organization_id = VALUES(organization_id)`,
            [companyId, encClientId, encClientSecret, organizationId || null]
        );

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Update Zoho settings error:', error);
        res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
};

// Initiate Connection (Get OAuth URL)
const connect = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.query.company_id || 1;

        const [rows] = await pool.execute(
            'SELECT * FROM zoho_books_integrations WHERE company_id = ?',
            [companyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Please save settings first' });
        }

        const integration = rows[0];
        const clientId = decrypt(integration.client_id);

        // Zoho OAuth URL
        // Scope: ZohoBooks.fullaccess.all (Adjust as needed)
        const scope = 'ZohoBooks.fullaccess.all';
        // Hardcoding to match Zoho Console configuration exactly
        const redirectUri = 'http://localhost:5000/api/v1/zoho-books/callback';
        const state = Buffer.from(JSON.stringify({ companyId })).toString('base64');

        const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${clientId}&state=${state}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&access_type=offline&prompt=consent`;

        res.json({ success: true, data: { url: authUrl } });

    } catch (error) {
        console.error('Zoho connect error:', error);
        res.status(500).json({ success: false, error: 'Failed to initiate connection: ' + error.message });
    }
};

// OAuth Callback
const callback = async (req, res) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/admin/integrations/zoho-books?error=${error}`);
        }

        if (!code || !state) {
            return res.status(400).send("Invalid callback request");
        }

        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        const companyId = decodedState.companyId;

        // Fetch credentials to exchange token
        const [rows] = await pool.execute(
            'SELECT * FROM zoho_books_integrations WHERE company_id = ?',
            [companyId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Integration record not found");
        }

        const integration = rows[0];
        const clientId = decrypt(integration.client_id);
        const clientSecret = decrypt(integration.client_secret);
        const redirectUri = 'http://localhost:5000/api/v1/zoho-books/callback';

        // Exchange Code for Token
        const tokenUrl = `https://accounts.zoho.com/oauth/v2/token?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`;

        const response = await axios.post(tokenUrl);

        if (response.data.error) {
            console.error('Zoho Token Error:', response.data);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/admin/integrations/zoho-books?error=token_exchange_failed`);
        }

        const { access_token, refresh_token, expires_in } = response.data;

        // Encrypt tokens
        const encAccessToken = encrypt(access_token);
        const encRefreshToken = refresh_token ? encrypt(refresh_token) : null; // Refresh token might not be returned if already valid

        // Update DB
        let updateQuery = `UPDATE zoho_books_integrations SET access_token = ?, status = 'Connected', last_sync = NULL`;
        const params = [encAccessToken];

        if (refresh_token) {
            updateQuery += `, refresh_token = ? `;
            params.push(encRefreshToken);
        }

        updateQuery += ` WHERE id = ? `;
        params.push(integration.id);

        await pool.execute(updateQuery, params);

        // Redirect back to frontend
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/admin/integrations/zoho-books?status=connected`);

    } catch (error) {
        console.error('Zoho callback error:', error);
        res.status(500).send("Internal Server Error during Zoho Callback");
    }
};

// Disconnect
const disconnect = async (req, res) => {
    try {
        const companyId = req.user?.company_id || req.body.company_id || 1;

        await pool.execute(
            `UPDATE zoho_books_integrations 
             SET access_token = NULL, refresh_token = NULL, status = 'Disconnected' 
             WHERE company_id = ? `,
            [companyId]
        );

        res.json({ success: true, message: 'Disconnected successfully' });
    } catch (error) {
        console.error('Zoho disconnect error:', error);
        res.status(500).json({ success: false, error: 'Failed to disconnect' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    connect,
    callback,
    disconnect
};
