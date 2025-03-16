import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const createToken = (userId: string): string => {
    // Set expiration to 30 days (in seconds)
    const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds

    return jwt.sign(
        { userId },
        process.env.JWT_TOKEN ?? "woriSecretK3y",
        { expiresIn }
    );
};
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    // console.log("Received token:", token);
    if (!token) {
        res.status(403).json({ message: "No token provided" }); return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN ?? "woriSecretK3y");
        // console.log("Decoded token:", decoded);
        req.user = { id: (decoded as any).userId };
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Authentication failed: Invalid token" }); return
    }
}   