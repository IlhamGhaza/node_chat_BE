import { RequestHandler, Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchAllMessagesByConversationId } from "../controllers/messageContrroller";

const router = Router();
router.get("/:conversationId", verifyToken, fetchAllMessagesByConversationId as unknown as RequestHandler);

export default router;