import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
});

async function connectDB(){
    await client.connect();
    const response = await client.query("SELECT * FROM users")
    console.log(response);
    
}
connectDB();
