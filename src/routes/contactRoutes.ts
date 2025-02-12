import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchContact, addContact, deleteContact } from "../controllers/contacController";

const router = Router();
router.get("/contactID", verifyToken, fetchContact);
router.post("/", verifyToken, addContact);
router.delete("/", verifyToken, deleteContact);

export default router;