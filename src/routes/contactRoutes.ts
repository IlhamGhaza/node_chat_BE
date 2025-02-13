import { Router, RequestHandler } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchContact, addContact, deleteContact } from "../controllers/contacController";

const router = Router();
router.get("/contactID", verifyToken, fetchContact as unknown as RequestHandler);
router.post("/", verifyToken, addContact as unknown as RequestHandler);
router.delete("/", verifyToken, deleteContact as unknown as RequestHandler);

export default router;
