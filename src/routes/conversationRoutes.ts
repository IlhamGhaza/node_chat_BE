import { Router, Request, Response } from "express";
import pool from "../models/db";
import { verifyToken } from "../controllers/middlewares/authMiddleware";

const router = Router();

router.get('/', verifyToken, async (req: Request, res: Response) => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }

    try {
        const result = await pool.query(
            'SELECT c.id AS conversationId, u.username AS participant_name, m.content AS last_message m.created_at AS last_message_time FROM conversations c JOIN users u ON (c.id = c.participant_two AND u.id != $1) LEFT JOIN LATERAL (SELECT content, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) m ON TRUE WHERE c.participant_one = $1 OR c.participant_two = $1 ORDER BY m.created_at DESC',
            [userId]

        );
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
export default router;
