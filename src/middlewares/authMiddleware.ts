import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Received token:", token);
    if (!token) {
        res.status(403).json({ message: "No token provided" }); return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN ?? "woriSecretK3y");
        console.log("Decoded token:", decoded);
        req.user = { id: (decoded as any).userId };
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" }); return
    }
}   