import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Use /tmp — the only writable directory on Vercel
const uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads";

// ✅ Ensure folder exists (recursive = true for nested paths)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
