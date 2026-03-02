import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json()); // Essential to parse JSON body

// 1. Zod Schema for Input Validation
const signupSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6)
});

// 2. Database Client
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
client.connect();

// 3. The Sign-Up Route
app.post('/signup', async (req, res) => {
    try {
        // Validate the input data using Zod
        const parsedData = signupSchema.parse(req.body);
        const { username, email, password } = parsedData;

        // Hash the password (using 10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into Neon Database
        const query = `
            INSERT INTO users (username, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING id, username, email;
        `;
        const values = [username, email, hashedPassword];

        const result = await client.query(query, values);

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
             message: "Invalid input" 
            });
        }
        
        // Handle Unique Constraint Errors (e.g., email already exists)
        if (error.code === '23505') {
            return res.status(409).json({ 
            message: "Username or Email already exists" 
        });
        }

        console.error(error);
        res.status(500).json({ 
        message: "Internal Server Error"
        });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));