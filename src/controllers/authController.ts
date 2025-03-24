import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../models/db";
import { ApiResponse } from "../types/api";
import { createToken } from "../middlewares/authMiddleware";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET ?? "woriSecretK3y";

export const register = async (req: Request, res: Response<ApiResponse<any>>) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Missing required fields",
            data: null
        });
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters with numbers and special characters",
            data: null
        });
    }

    try {
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists",
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
            [username, email, hashedPassword]
        );

        return res.status(201).json({
            message: "User registered successfully",
            data: {
                user: result.rows[0],
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};

export const login = async (req: Request, res: Response<ApiResponse<any>>) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
            data: null
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
            [email]
        );

        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid credentials",
                data: null
            });
        }

        const token = createToken(user.id);

        return res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    token
                },
                // token
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
};
