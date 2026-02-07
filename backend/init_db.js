const { pool } = require('./db');

async function initDb() {
    const client = await pool.connect();
    try {
        console.log('Starting Database Initialization...');

        // Enable UUID extension
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('✅ UUID extension enabled');

        // Profiles Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                full_name TEXT,
                mobile TEXT,
                mobile_secondary TEXT,
                country_code TEXT DEFAULT '+91',
                profile_picture TEXT,
                role TEXT DEFAULT 'user',
                trial_expires_at TIMESTAMP,
                is_blocked BOOLEAN DEFAULT false,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Profiles table ready');

        // Trucks Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS trucks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                owner_id UUID REFERENCES profiles(id),
                truck_number TEXT NOT NULL,
                model TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Trucks table ready');

        // Drivers Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS drivers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                license_number TEXT,
                photo_url TEXT,
                aadhar_url TEXT,
                mobile_primary TEXT NOT NULL,
                mobile_secondary TEXT,
                blood_group TEXT,
                salary DECIMAL(10,2),
                advance DECIMAL(10,2) DEFAULT 0,
                assigned_truck_id UUID REFERENCES trucks(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Drivers table ready');

        // Trips Table
        await client.query(`
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
        console.log('✅ Trips table ready');

        // Payments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                trip_id UUID REFERENCES trips(id),
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                mode TEXT DEFAULT 'cash',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Payments table ready');

        // Expenses Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                truck_id UUID REFERENCES trucks(id),
                amount DECIMAL(10,2) NOT NULL,
                category TEXT,
                description TEXT,
                expense_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Expenses table ready');

        // Petrol Pumps Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS petrol_pumps (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Petrol Pumps table ready');

        // Fuel Expenses Table
        await client.query(`
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
        console.log('✅ Fuel Expenses table ready');

        // OTP Codes Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ OTP Codes table ready');

        // Suppliers & Materials (Self-initializing via SERIAL)
        await client.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                address TEXT,
                mobile TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS materials (
                id SERIAL PRIMARY KEY,
                owner_id UUID REFERENCES profiles(id),
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Master data tables ready');

        // Notices Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                owner_id UUID REFERENCES profiles(id),
                content TEXT NOT NULL,
                scheduled_for DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Notices table ready');

        console.log('🚀 Database Initialization Complete!');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

initDb();
