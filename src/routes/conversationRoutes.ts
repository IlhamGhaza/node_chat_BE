import { Router, Request, Response, RequestHandler } from "express";
import pool from "../models/db";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchAllConversationsByUserId } from "../controllers/conversationController";

const router = Router();

router.get('/', verifyToken, fetchAllConversationsByUserId as unknown as RequestHandler);
export default router;
