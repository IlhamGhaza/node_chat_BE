import pool from "../models/db";
import { Request, Response } from "express";

export const fetchAllMessagesByConversationId = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
    console.log("Conversation ID:", conversationId);
    try {
        const result = await pool.query(
            // `SELECT m.id, m.content, m.created_at, c.participant_one, c.participant_two
            //     FROM messages m
            //     JOIN conversations c ON m.conversation_id = c.id
            //     WHERE c.participant_one = $1 OR c.participant_two = $1
            //     ORDER BY m.created_at ASC`,
            `SELECT m.id, m.content, m.conversation_id, c.participant_one, c.participant_two, c.created_at
                FROM messages m
                JOIN conversations c ON m.conversation_id = c.id
                WHERE m.conversation_id = $1
                ORDER BY m.created_at ASC`,
            [conversationId]
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

export const saveMessage = async (conversationId: string, senderId: string, content: string) => {
    try {
        const result = await pool.query(
            `INSERT INTO messages (conversation_id, content, created_at, updated_at, deleted_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
                RETURNING *`,
            [conversationId, senderId, content]
        )
        console.log('Fetched conversations:', result.rows);
    return result.rows[0];
    }
    catch (err) {
        console.error('Error saving message:', err);
        throw new Error("Failed to save message");
    }
}