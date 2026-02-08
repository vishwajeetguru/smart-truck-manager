const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { query } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'https://smart-truck-manager.netlify.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check for production
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper to send verification email
const sendVerificationEmail = async (email, otp) => {
    const verifyLink = `${FRONTEND_URL}/verify?email=${email}&code=${otp}`;
    const mailOptions = {
        from: `"Smart Truck Manager" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - Smart Truck Manager',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb;">Welcome to Smart Truck Manager!</h2>
                <p>Thank you for registering. Please verify your email using the OTP below or click the button.</p>
                <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyLink}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Directly</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/send-otp', async (req, res) => {
    const { email, method } = req.body;
    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

        // Store OTP
        await query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        // Send Email if method is email
        if (method === 'email') {
            try {
                await sendVerificationEmail(email, otp);
            } catch (emailErr) {
                console.error('Email send failed:', emailErr);
                let errorMessage = 'Failed to send verification email';
                if (emailErr.code === 'EAUTH') {
                    errorMessage = 'Email Authentication Failed: Please use a Gmail App Password in your .env file.';
                }
                return res.status(500).json({ message: errorMessage });
            }
        } else {
            // Placeholder for SMS logic
            console.log(`[SMS Placeholder] Sending OTP ${otp} to ${email}`);
        }

        res.json({ message: 'OTP sent successfully', email });
    } catch (err) {
        console.error('Send OTP outer error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, full_name, mobile } = req.body;
    try {
        // Check if user already exists
        const userExists = await query('SELECT id FROM profiles WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
        const result = await query(
            'INSERT INTO profiles (email, password_hash, full_name, mobile, is_verified, trial_expires_at) VALUES ($1, $2, $3, $4, false, $5) RETURNING id, email, full_name',
            [email, hashedPassword, full_name, mobile, trialExpiresAt]
        );
        const user = result.rows[0];

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

        // Store OTP
        await query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        // Send Email
        try {
            await sendVerificationEmail(email, otp);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr);
            // We still registered the user, they can resend OTP later
        }

        res.status(201).json({
            message: 'Registration successful. Please check your email for verification code.',
            email: user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    try {
        // Validate OTP
        const otpResult = await query(
            'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check if user profile exists
        const userCheck = await query('SELECT * FROM profiles WHERE email = $1', [email]);

        let user;
        if (userCheck.rows.length === 0) {
            // Create a minimal profile for new users (they'll complete it later)
            const newUserResult = await query(
                'INSERT INTO profiles (email, password_hash, is_verified) VALUES ($1, $2, true) RETURNING *',
                [email, ''] // Empty password hash - will be set during profile setup
            );
            user = newUserResult.rows[0];
        } else {
            // Mark existing user as verified
            await query('UPDATE profiles SET is_verified = true WHERE email = $1', [email]);
            user = userCheck.rows[0];
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        // Cleanup used OTP
        await query('DELETE FROM otp_codes WHERE email = $1', [email]);

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_blocked: user.is_blocked,
                is_verified: true,
                trial_expires_at: user.trial_expires_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Verification error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM profiles WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email first', email: user.email });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_blocked: user.is_blocked,
                is_verified: user.is_verified,
                trial_expires_at: user.trial_expires_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT id, email, full_name, mobile, mobile_secondary, country_code, profile_picture, role, trial_expires_at, is_blocked, is_verified, password_hash FROM profiles WHERE id = $1', [req.user.id]);
        const profile = result.rows[0];
        // Return information if password is set but don't return the hash
        const has_password = !!profile.password_hash;
        delete profile.password_hash;
        res.json({ ...profile, has_password });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/auth/profile', authenticateToken, async (req, res) => {
    const { full_name, mobile, mobile_secondary, country_code, profile_picture, current_password, new_password } = req.body;
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (full_name !== undefined) {
            updates.push(`full_name = $${paramCount++}`);
            values.push(full_name);
        }
        if (mobile !== undefined) {
            updates.push(`mobile = $${paramCount++}`);
            values.push(mobile);
        }
        if (mobile_secondary !== undefined) {
            updates.push(`mobile_secondary = $${paramCount++}`);
            values.push(mobile_secondary);
        }
        if (country_code !== undefined) {
            updates.push(`country_code = $${paramCount++}`);
            values.push(country_code);
        }
        if (profile_picture !== undefined) {
            updates.push(`profile_picture = $${paramCount++}`);
            values.push(profile_picture);
        }

        // Handle password update if provided
        if (new_password) {
            const userResult = await query('SELECT password_hash FROM profiles WHERE id = $1', [req.user.id]);
            const user = userResult.rows[0];

            if (user.password_hash) {
                if (!current_password) {
                    return res.status(400).json({ message: 'Current password is required to set a new one' });
                }
                const isMatch = await bcrypt.compare(current_password, user.password_hash);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Incorrect current password' });
                }
            }

            const hashedNewPassword = await bcrypt.hash(new_password, 10);
            updates.push(`password_hash = $${paramCount++}`);
            values.push(hashedNewPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(req.user.id);
        const result = await query(
            `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, mobile, mobile_secondary, country_code, profile_picture, role, trial_expires_at, is_blocked, is_verified`,
            values
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { current_password, new_password, is_create } = req.body;
    try {
        // Fetch current user's password hash
        const userResult = await query('SELECT password_hash FROM profiles WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        if (!is_create) {
            if (!user.password_hash) {
                return res.status(400).json({ message: 'No password set. Please use create mode.' });
            }
            const isMatch = await bcrypt.compare(current_password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect current password' });
            }
        }

        const hashedNewPassword = await bcrypt.hash(new_password, 10);
        await query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating password' });
    }
});

// --- TRUCK ROUTES ---

app.get('/api/trucks', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM trucks WHERE owner_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/trucks', authenticateToken, async (req, res) => {
    const { truck_number, model } = req.body;
    try {
        const result = await query(
            'INSERT INTO trucks (owner_id, truck_number, model) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, truck_number, model]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/trucks/:id', authenticateToken, async (req, res) => {
    const { truck_number, model } = req.body;
    try {
        const result = await query(
            'UPDATE trucks SET truck_number = COALESCE($1, truck_number), model = COALESCE($2, model) WHERE id = $3 AND owner_id = $4 RETURNING *',
            [truck_number, model, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Truck not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/trucks/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('DELETE FROM trucks WHERE id = $1 AND owner_id = $2 RETURNING *', [req.params.id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Truck not found' });
        res.json({ message: 'Truck deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- TRIP ROUTES ---

// Create table or update schema
(async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS trips (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                truck_id UUID REFERENCES trucks(id),
                trip_date DATE,
                supplier TEXT,
                client TEXT,
                location TEXT,
                material TEXT,
                material_price DECIMAL(10,2),
                trips_count INTEGER,
                total_order_value DECIMAL(10,2),
                profit DECIMAL(10,2),
                total_expense DECIMAL(10,2),
                remark TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Add new columns if table exists without them
        try { await query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT'); } catch (e) { }
        try { await query('ALTER TABLE trips RENAME COLUMN actual_income TO total_order_value'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS total_order_value DECIMAL(10,2)'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS material_price DECIMAL(10,2)'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS profit DECIMAL(10,2)'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS total_expense DECIMAL(10,2)'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS remark TEXT'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS location TEXT'); } catch (e) { }
        try { await query('ALTER TABLE trips ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'pending\''); } catch (e) { }


        // New Tables
        await query(`
            CREATE TABLE IF NOT EXISTS clients (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                address TEXT,
                mobile TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                owner_id UUID REFERENCES profiles(id),
                title TEXT,
                content TEXT,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS trip_expenses (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                trip_id UUID REFERENCES trips(id),
                category TEXT,
                amount DECIMAL(10,2),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS driver_payments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                driver_id UUID REFERENCES drivers(id),
                owner_id UUID REFERENCES profiles(id),
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                payment_type TEXT DEFAULT 'salary', -- salary, advance, bonus, other
                remark TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing database tables:', err);
    }
})();

app.get('/api/trips', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                t.id, t.truck_id, t.trip_date, t.supplier, t.client, t.location, t.material, 
                t.material_price, t.trips_count, t.total_order_value, t.profit, t.total_expense, t.remark,
                COALESCE(t.total_order_value, t.amount, 0) as amount,
                tr.truck_number, tr.model as truck_model,
                COALESCE(SUM(p.amount), 0) as paid_amount,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= COALESCE(t.total_order_value, t.amount, 0) THEN 'received'
                    ELSE 'pending'
                END as status
            FROM trips t
            JOIN trucks tr ON t.truck_id = tr.id
            LEFT JOIN payments p ON t.id = p.trip_id
            WHERE tr.owner_id = $1
            GROUP BY t.id, tr.id
            ORDER BY t.trip_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.post('/api/trips', authenticateToken, async (req, res) => {
    const { truck_id, trip_date, supplier, client, location, material, material_price, trips_count, total_order_value, profit, total_expense, remark, payment_status } = req.body;
    try {
        const truckCheck = await query('SELECT id FROM trucks WHERE id = $1 AND owner_id = $2', [truck_id, req.user.id]);
        if (truckCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized truck' });

        const result = await query(
            'INSERT INTO trips (truck_id, trip_date, supplier, client, location, material, material_price, trips_count, total_order_value, profit, total_expense, remark, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [truck_id, trip_date, supplier, client, location, material, material_price, trips_count, total_order_value, profit, total_expense, remark, payment_status === 'received' ? 'received' : 'pending']
        );
        const newTrip = result.rows[0];

        // If payment status is received, record the payment immediately
        if (payment_status === 'received') {
            await query(
                'INSERT INTO payments (trip_id, amount, payment_date, mode) VALUES ($1, $2, $3, $4)',
                [newTrip.id, total_order_value, trip_date, 'cash']
            );
        }

        res.status(201).json(newTrip);
    } catch (err) {
        console.error('Trip Save Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.patch('/api/trips/:id', authenticateToken, async (req, res) => {
    const fields = req.body;
    // Map actual_income to total_order_value if present in update
    if (fields.actual_income !== undefined) {
        fields.total_order_value = fields.actual_income;
        delete fields.actual_income;
    }
    const sets = Object.keys(fields).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), req.params.id, req.user.id];
    try {
        const result = await query(`
            UPDATE trips SET ${sets} 
            WHERE id = $${Object.keys(fields).length + 1} 
            AND truck_id IN (SELECT id FROM trucks WHERE owner_id = $${Object.keys(fields).length + 2})
            RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/trips/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
            DELETE FROM trips 
            WHERE id = $1 
            AND truck_id IN (SELECT id FROM trucks WHERE owner_id = $2)
            RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
        res.json({ message: 'Trip deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- PAYMENT ROUTES ---

app.get('/api/payments', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                t.id, 
                t.trip_date as date, 
                COALESCE(t.total_order_value, t.amount, 0) as amount, 
                t.client, t.supplier, t.material, t.material_price, t.trips_count, t.location, t.profit, t.total_expense, t.remark,
                tr.truck_number, tr.model as truck_model,
                COALESCE(SUM(p.amount), 0) as paid_amount,
                CASE 
                    WHEN COALESCE(SUM(p.amount), 0) >= COALESCE(t.total_order_value, t.amount, 0) THEN 'received'
                    ELSE 'pending'
                END as status
            FROM trips t
            JOIN trucks tr ON t.truck_id = tr.id
            LEFT JOIN payments p ON t.id = p.trip_id
            WHERE tr.owner_id = $1
            GROUP BY t.id, tr.id
            ORDER BY t.trip_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/payments', authenticateToken, async (req, res) => {
    const { trip_id, amount, payment_date, mode } = req.body;
    try {
        const tripCheck = await query(`
            SELECT trips.id FROM trips 
            JOIN trucks ON trips.truck_id = trucks.id 
            WHERE trips.id = $1 AND trucks.owner_id = $2`,
            [trip_id, req.user.id]
        );
        if (tripCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized trip' });

        const result = await query(
            'INSERT INTO payments (trip_id, amount, payment_date, mode) VALUES ($1, $2, $3, $4) RETURNING *',
            [trip_id, amount, payment_date, mode]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- EXPENSE ROUTES ---

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
            SELECT expenses.*, trucks.truck_number FROM expenses 
            JOIN trucks ON expenses.truck_id = trucks.id 
            WHERE trucks.owner_id = $1 
            ORDER BY expense_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    const { truck_id, amount, category, description, expense_date } = req.body;
    try {
        const truckCheck = await query('SELECT id FROM trucks WHERE id = $1 AND owner_id = $2', [truck_id, req.user.id]);
        if (truckCheck.rows.length === 0) return res.status(403).json({ message: 'Unauthorized truck' });

        const result = await query(
            'INSERT INTO expenses (truck_id, amount, category, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [truck_id, amount, category, description, expense_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DRIVER ROUTES ---

app.get('/api/notices', authenticateToken, async (req, res) => {
    res.json([{ id: 1, content: 'Welcome to Smart Truck Manager! Drive safely.' }]);
});

// --- SUPPLIERS ---

// Create table if not exists
(async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                address TEXT,
                mobile TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing suppliers table:', err);
    }
})();

app.get('/api/suppliers', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM suppliers WHERE owner_id = $1 ORDER BY name ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/suppliers', authenticateToken, async (req, res) => {
    const { name, address, mobile } = req.body;
    try {
        const result = await query(
            'INSERT INTO suppliers (owner_id, name, address, mobile) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, name, address, mobile]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/suppliers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, mobile } = req.body;
    try {
        const result = await query(
            'UPDATE suppliers SET name = $1, address = $2, mobile = $3 WHERE id = $4 AND owner_id = $5 RETURNING *',
            [name, address, mobile, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/suppliers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM suppliers WHERE id = $1 AND owner_id = $2 RETURNING *', [id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- MATERIALS ---

// Create table if not exists
(async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS materials (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing materials table:', err);
    }
})();

app.get('/api/materials', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM materials WHERE owner_id = $1 ORDER BY name ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/materials', authenticateToken, async (req, res) => {
    const { name } = req.body;
    try {
        const result = await query(
            'INSERT INTO materials (owner_id, name) VALUES ($1, $2) RETURNING *',
            [req.user.id, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.patch('/api/materials/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await query(
            'UPDATE materials SET name = $1 WHERE id = $2 AND owner_id = $3 RETURNING *',
            [name, id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Material not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/materials/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM materials WHERE id = $1 AND owner_id = $2 RETURNING *', [id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Material not found' });
        res.json({ message: 'Material deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- PETROL PUMPS ---

// Create table if not exists
(async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS petrol_pumps (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing petrol_pumps table:', err);
    }
})();

app.get('/api/petrol-pumps', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM petrol_pumps WHERE owner_id = $1 ORDER BY name ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/petrol-pumps', authenticateToken, async (req, res) => {
    const { name, location } = req.body;
    try {
        const result = await query(
            'INSERT INTO petrol_pumps (owner_id, name, location) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, name, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/petrol-pumps/:id', authenticateToken, async (req, res) => {
    try {
        await query('DELETE FROM petrol_pumps WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Petrol pump deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- FUEL EXPENSES ---

// Create table if not exists
(async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS fuel_expenses (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                truck_id UUID REFERENCES trucks(id),
                pump_id INTEGER REFERENCES petrol_pumps(id),
                expense_date DATE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                liters DECIMAL(10,2) NOT NULL,
                filled_by TEXT NOT NULL,
                driver_id UUID REFERENCES drivers(id),
                receipt_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        console.error('Error initializing fuel_expenses table:', err);
    }
})();

app.get('/api/fuel-expenses', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
            SELECT f.*, t.truck_number, p.name as pump_name, d.name as driver_name
            FROM fuel_expenses f
            JOIN trucks t ON f.truck_id = t.id
            LEFT JOIN petrol_pumps p ON f.pump_id = p.id
            LEFT JOIN drivers d ON f.driver_id = d.id
            WHERE f.owner_id = $1
            ORDER BY f.expense_date DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/fuel-expenses', authenticateToken, async (req, res) => {
    const { truck_id, pump_id, expense_date, amount, liters, filled_by, driver_id, receipt_url } = req.body;
    try {
        const result = await query(
            `INSERT INTO fuel_expenses (owner_id, truck_id, pump_id, expense_date, amount, liters, filled_by, driver_id, receipt_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [req.user.id, truck_id, pump_id, expense_date, amount, liters, filled_by, driver_id, receipt_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/fuel-expenses/:id', authenticateToken, async (req, res) => {
    try {
        await query('DELETE FROM fuel_expenses WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Fuel expense deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- DRIVER ROUTES ---

app.get('/api/drivers', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM drivers WHERE owner_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/drivers/:id', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching driver: ${req.params.id} for owner: ${req.user.id}`);
        const result = await query('SELECT * FROM drivers WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
        if (result.rows.length === 0) {
            console.log(`Driver ${req.params.id} not found or doesn't belong to ${req.user.id}`);
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching driver:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/drivers', authenticateToken, async (req, res) => {
    const { name, license_number, photo_url, aadhar_url, mobiles, blood_group, salary, advance, assigned_truck_id } = req.body;

    // Map mobiles array to primary and secondary columns
    const mobile_primary = mobiles && mobiles.length > 0 ? mobiles[0] : null;
    const mobile_secondary = mobiles && mobiles.length > 1 ? mobiles[1] : null;

    if (!mobile_primary) {
        return res.status(400).json({ message: 'Primary mobile number is required' });
    }

    try {
        const result = await query(
            `INSERT INTO drivers (owner_id, name, license_number, photo_url, aadhar_url, mobile_primary, mobile_secondary, blood_group, salary, advance, assigned_truck_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [req.user.id, name, license_number, photo_url, aadhar_url, mobile_primary, mobile_secondary, blood_group, salary, advance, assigned_truck_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.patch('/api/drivers/:id', authenticateToken, async (req, res) => {
    const { name, license_number, photo_url, aadhar_url, mobiles, blood_group, salary, advance, assigned_truck_id } = req.body;

    // Map mobiles array to primary and secondary columns if provided
    let mobile_primary = null;
    let mobile_secondary = null;

    if (mobiles) {
        mobile_primary = mobiles.length > 0 ? mobiles[0] : null;
        mobile_secondary = mobiles.length > 1 ? mobiles[1] : null;
    }

    try {
        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
        if (license_number !== undefined) { updates.push(`license_number = $${paramCount++}`); values.push(license_number); }
        if (photo_url !== undefined) { updates.push(`photo_url = $${paramCount++}`); values.push(photo_url); }
        if (aadhar_url !== undefined) { updates.push(`aadhar_url = $${paramCount++}`); values.push(aadhar_url); }
        if (mobile_primary !== null) { updates.push(`mobile_primary = $${paramCount++}`); values.push(mobile_primary); }
        if (mobile_secondary !== null) { updates.push(`mobile_secondary = $${paramCount++}`); values.push(mobile_secondary); }
        else if (mobiles && mobiles.length === 1) {
            // If mobiles array provided but only has 1 item, explicitly set secondary to null
            updates.push(`mobile_secondary = $${paramCount++}`); values.push(null);
        }
        if (blood_group !== undefined) { updates.push(`blood_group = $${paramCount++}`); values.push(blood_group); }
        if (salary !== undefined) { updates.push(`salary = $${paramCount++}`); values.push(salary); }
        if (advance !== undefined) { updates.push(`advance = $${paramCount++}`); values.push(advance); }
        if (assigned_truck_id !== undefined) { updates.push(`assigned_truck_id = $${paramCount++}`); values.push(assigned_truck_id); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(req.params.id);
        values.push(req.user.id);

        const result = await query(
            `UPDATE drivers SET ${updates.join(', ')} WHERE id = $${paramCount} AND owner_id = $${paramCount + 1} RETURNING *`,
            values
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.delete('/api/drivers/:id', authenticateToken, async (req, res) => {
    try {
        await query('DELETE FROM drivers WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Driver deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- DRIVER PAYMENT ROUTES ---

app.get('/api/drivers/:id/payments', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching payments for driver: ${req.params.id} for owner: ${req.user.id}`);
        const result = await query(
            'SELECT * FROM driver_payments WHERE driver_id = $1 AND owner_id = $2 ORDER BY payment_date DESC',
            [req.params.id, req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching driver payments:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.post('/api/drivers/:id/payments', authenticateToken, async (req, res) => {
    const { amount, payment_date, payment_type, remark } = req.body;
    try {
        console.log(`Recording payment for driver: ${req.params.id} for owner: ${req.user.id}`);
        // Verify driver belongs to owner
        const driverCheck = await query('SELECT id FROM drivers WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.id]);
        if (driverCheck.rows.length === 0) {
            console.log(`Driver ${req.params.id} not found or doesn't belong to ${req.user.id} during payment recording`);
            return res.status(403).json({ message: 'Unauthorized driver' });
        }

        const result = await query(
            `INSERT INTO driver_payments (driver_id, owner_id, amount, payment_date, payment_type, remark)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.params.id, req.user.id, amount, payment_date, payment_type, remark]
        );

        // Update driver's advance if payment_type is 'advance' or adjust balance logic if needed
        // For now just record the payment

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error recording driver payment:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
