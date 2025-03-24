import { Router, Request, Response, RequestHandler } from "express";
import pool from "../models/db";
import { verifyToken } from "../middlewares/authMiddleware";
import { checkOrCreateConversation, deleteAllMessages, deleteConversation, deleteMessage, fetchAllConversationsByUserId, getConversationById } from "../controllers/conversationController";

const router = Router();

// Get all conversations for the authenticated user
router.get('/', verifyToken, fetchAllConversationsByUserId as unknown as RequestHandler);

// Check if a conversation exists or create a new one
router.post('/check-or-create', verifyToken, checkOrCreateConversation as unknown as RequestHandler);

// Get a specific conversation by ID
router.get('/:id', verifyToken, getConversationById as unknown as RequestHandler);

// Delete a conversation (soft delete)
router.delete('/:conversationId', verifyToken, deleteConversation as unknown as RequestHandler);

router.delete('/:conversationId/messages/:messageId', verifyToken, deleteMessage as unknown as RequestHandler);

router.delete('/:conversationId/messages', verifyToken, deleteAllMessages as unknown as RequestHandler);

export default router;
