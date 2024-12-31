import { Request, Response , NextFunction} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../models/db";

const Salt_Rounds = 10;
const jwt_secret = process.env.JWT_SECRET ?? "woriSecretK3y";

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long and contain at least 2 unique characters (numbers or special characters)"
        });
    }

    try {
        // Check if user already exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, Salt_Rounds);
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );
        const user = result.rows[0];

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof Error) {
            res.status(500).json({ message: "Registration failed", error: error.message });
        } else {
            res.status(500).json({ message: "Registration failed" });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.banned) {
            return res.status(401).json({ message: "Your account is banned" });
        }

        // Periksa password menggunakan bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user.id }, jwt_secret, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }

};