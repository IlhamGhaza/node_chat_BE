import { Request, Response } from "express";
import pool, { savePhotoProfile } from "../models/db";
import fs from 'fs';
import path from 'path';
import { ApiResponse } from "../types/api";

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function uploadPhotoProfile(req: Request, res: Response<ApiResponse<any>>) {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    if (!file) {
        return res.status(400).json({
            message: "No file uploaded",
            data: null
        });
    }

    try {
        const photoUrl = `uploads/photos/${file.filename}`;
        const result = await savePhotoProfile(userId, photoUrl);

        if (result) {
            return res.status(200).json({
                message: "Photo uploaded successfully",
                data: {
                    photoUrl,
                    message: "Photo uploaded successfully"
                }
            });
        }

        fs.unlinkSync(path.join(uploadDir, file.filename));
        return res.status(400).json({
            message: "Failed to save photo",
            data: null
        });
    } catch (error) {
        if (file) {
            fs.unlinkSync(path.join(uploadDir, file.filename));
        }
        console.error("Upload error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

export async function updateProfile(req: Request, res: Response<ApiResponse<any>>) {
    const userId = req.user?.id;
    const { username, email } = req.body;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    if (!username || !email) {
        return res.status(400).json({
            message: "Username and email are required",
            data: null
        });
    }

    try {
        const result = await pool.query(
            "UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
            [username, email, userId]
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            data: result.rows
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}
