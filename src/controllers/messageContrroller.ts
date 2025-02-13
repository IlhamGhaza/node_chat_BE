import { Request, Response } from "express";
import pool from "../models/db";
import { ApiResponse } from "../types/api";

export const fetchAllMessagesByConversationId = async (req: Request, res: Response<ApiResponse<any>>) => {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
            data: null
        });
    }

    if (!conversationId) {
        return res.status(400).json({
            message: "Conversation ID is required",
            data: null
        });
    }

    try {
        const result = await pool.query(`
            SELECT 
                m.id,
                m.content,
                m.conversation_id,
                m.created_at,
                c.participant_one,
                c.participant_two
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.conversation_id = $1
                AND m.deleted_at IS NULL
                AND (c.participant_one = $2 OR c.participant_two = $2)
            ORDER BY m.created_at ASC`,
            [conversationId, userId]
        );

        return res.json({
            message: "Messages retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            message: "Internal server error",
            data: null
        });
    }
}

export const saveMessage = async (conversationId: string, senderId: string, content: string) => {
    if (!conversationId || !senderId || !content) {
        throw new Error("Missing required parameters");
    }

    try {
        const result = await pool.query(`
            INSERT INTO messages (
                conversation_id,
                content,
                created_at,
                updated_at
            ) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [conversationId, content]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error saving message:', error);
        throw new Error("Failed to save message");
    }
}
