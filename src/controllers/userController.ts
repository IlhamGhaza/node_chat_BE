import { Request, Response } from "express";
import pool from "../models/db";
import fs from 'fs';
import path from 'path';
import { ApiResponse } from "../types/api";

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function getProfile(req: Request, res: Response<ApiResponse<any>>) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        const result = await pool.query(
            "SELECT id, username, email, photo_profile FROM users WHERE id = $1",
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "User not found",
                data: null
            });
        }

        // Process the user data to replace null photo_profile with first letter of username
        const userData = result.rows[0];
        const processedUser = {
            ...userData,
            photo_profile: userData.photo_profile ||
                (userData.username ? userData.username.charAt(0).toUpperCase() : 'U')
        };

        return res.status(200).json({
            message: "Profile retrieved successfully",
            data: processedUser
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

export async function updateProfile(req: Request, res: Response<ApiResponse<any>>) {
    const userId = req.user?.id;
    const { username, email } = req.body;
    const file = req.file;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    // Check if at least one field to update is provided
    if (!username && !email && !file) {
        return res.status(400).json({
            message: "At least one field (username, email, or photo) must be provided for update",
            data: null
        });
    }

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Get current user data
        const currentUserResult = await pool.query(
            "SELECT username, email FROM users WHERE id = $1",
            [userId]
        );

        if (currentUserResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({
                message: "User not found",
                data: null
            });
        }

        const currentUser = currentUserResult.rows[0];

        // Update user profile data only if provided
        if (username || email) {
            await pool.query(
                "UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
                [
                    username || currentUser.username,
                    email || currentUser.email,
                    userId
                ]
            );
        }

        // If a new photo was uploaded, update the photo_profile
        if (file) {
            const photoUrl = `uploads/photos/${file.filename}`;

            // Get current photo_profile to delete old file if exists
            const currentPhotoResult = await pool.query(
                "SELECT photo_profile FROM users WHERE id = $1",
                [userId]
            );

            const currentPhoto = currentPhotoResult.rows[0]?.photo_profile;

            // Update photo_profile in database
            await pool.query(
                "UPDATE users SET photo_profile = $1 WHERE id = $2",
                [photoUrl, userId]
            );

            // Delete old photo if it exists and is not the default
            if (currentPhoto && !currentPhoto.startsWith('http') && fs.existsSync(path.join(process.cwd(), 'public', currentPhoto))) {
                fs.unlinkSync(path.join(process.cwd(), 'public', currentPhoto));
            }
        }

        // Commit the transaction
        await pool.query('COMMIT');

        // Get the updated user data
        const result = await pool.query(
            "SELECT id, username, email, photo_profile FROM users WHERE id = $1",
            [userId]
        );

        // Process the user data to replace null photo_profile with first letter of username
        const userData = result.rows[0];
        const processedUser = {
            ...userData,
            photo_profile: userData.photo_profile ||
                (userData.username ? userData.username.charAt(0).toUpperCase() : 'U')
        };

        return res.status(200).json({
            message: "Profile updated successfully",
            data: processedUser
        });
    } catch (error) {
        // Rollback in case of error
        await pool.query('ROLLBACK');

        // Delete uploaded file if exists
        if (file && fs.existsSync(path.join(uploadDir, file.filename))) {
            fs.unlinkSync(path.join(uploadDir, file.filename));
        }

        console.error("Profile update error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}
