import { Router } from "express";
import multer from "multer";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, "../uploads");
mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    cb(null, `${ts}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/", "video/", "application/octet-stream"];
    cb(null, allowed.some((t) => file.mimetype.startsWith(t)));
  },
});

const router = Router();

// POST /api/upload/recording
// Accepts multipart audio or video file from the mobile app.
router.post("/recording", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file received." });
  }
  res.json({
    filename: req.file.filename,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
  });
});

export default router;
