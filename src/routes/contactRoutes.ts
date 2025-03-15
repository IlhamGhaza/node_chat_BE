import { Router, RequestHandler } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchContact, addContact, deleteContact, fetchAllContacts } from "../controllers/contacController";

const router = Router();
router.get("/:contactId", verifyToken, fetchContact as unknown as RequestHandler);
router.get("/", verifyToken, fetchAllContacts as unknown as RequestHandler);
router.post("/", verifyToken, addContact as unknown as RequestHandler);
router.delete("/", verifyToken, deleteContact as unknown as RequestHandler);

export default router;
