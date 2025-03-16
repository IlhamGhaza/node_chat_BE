import { Router, RequestHandler } from "express";
import multer from "multer";
import path from 'path';
import { verifyToken } from "../middlewares/authMiddleware";
import { getProfile, updateProfile } from "../controllers/userController";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg, jpeg and png are allowed.'));
        }
    }
});

const router = Router();

// Error handler middleware for multer
const handleMulterError = (error: any, req: any, res: any, next: any) => {
    if (error) {
        return res.status(400).json({ message: error.message, data: null });
    }
    next();
};
// Keep the separate photo upload endpoint for backward compatibility
// router.post(
//     "/upload-photo",
//     verifyToken,
//     upload.single("photo"),
//     handleMulterError,
//     uploadPhotoProfile as unknown as RequestHandler
// );

router.get("/profile", verifyToken, getProfile as unknown as RequestHandler);

// Updated profile endpoint that can handle both profile data and photo upload
router.put(
    "/profile",
    verifyToken,
    upload.single("photo"),
    handleMulterError,
    updateProfile as unknown as RequestHandler
);

export default router;
