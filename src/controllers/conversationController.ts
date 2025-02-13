import { Request, Response } from "express";
import pool from "../models/db";
import { ApiResponse } from "../types/api";

export const fetchAllConversationsByUserId = async (req: Request, res: Response<ApiResponse<any>>) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    try {
        const result = await pool.query(`
            SELECT 
                c.id AS conversationId,
                u.username AS participant_name,
                u.photo_profile AS participant_photo,
                m.content AS last_message,
                m.created_at AS last_message_time
            FROM conversations c
            JOIN users u ON (c.participant_two = u.id AND u.id != $1)
            LEFT JOIN LATERAL (
                SELECT content, created_at 
                FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC 
                LIMIT 1
            ) m ON TRUE
            WHERE (c.participant_one = $1 OR c.participant_two = $1)
                AND c.deleted_at IS NULL
            ORDER BY m.created_at DESC NULLS LAST`,
            [userId]
        );

        return res.json({
            message: "Conversations retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}
