import { Router, RequestHandler } from "express";
import multer from "multer";
import path from 'path';
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadPhotoProfile } from "../controllers/userController";

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

router.post(
    "/upload-photo",
    verifyToken,
    upload.single("photo"),
    (error: any, req: any, res: any, next: any) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: error.message });
        } else if (error) {
            return res.status(400).json({ error: error.message });
        }
        next();
    },
    uploadPhotoProfile as unknown as RequestHandler
);

router.get('/profile', verifyToken);

export default router;
