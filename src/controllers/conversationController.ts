import pool from "../models/db";
import { Request, Response } from "express";

export const fetchAllConversationsByUserId = async (req: Request, res: Response) => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    console.log("User ID:", userId);

    try {
        const result = await pool.query(
            'SELECT c.id AS conversationId, u.username AS participant_name, m.content AS last_message, m.created_at AS last_message_time FROM conversations c JOIN users u ON (c.participant_two = u.id AND u.id != $1) LEFT JOIN LATERAL (SELECT content, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) m ON TRUE WHERE c.participant_one = $1 OR c.participant_two = $1 ORDER BY m.created_at DESC',
            [userId]
        )
        console.log('Fetched conversations:', result.rows);
        res.json(result.rows);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching conversations:', err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            console.error('Unknown error:', err);
            res.status(500).json({ error: "Unknown Error" });
        }
    }
}