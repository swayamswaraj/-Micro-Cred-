import multer from "multer";
import fs from "fs";
import path from "path";

// Determine upload directory
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? "/tmp" : process.env.UPLOAD_DIR || "uploads";

// Only try to create folders locally (Vercel is read-only)
if (!isVercel && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created local upload directory: ${uploadDir}`);
}

if (isVercel) {
  console.log("⚙️ Running on Vercel — using memory storage");
}

// Use memory storage on Vercel, disk storage locally
const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
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
