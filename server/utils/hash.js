// server/utils/hash.js (FIXED for 500 Internal Server Error)
import crypto from "crypto";
import fs from "fs"; // FIX: Use ES Module import for fs

export function computeSHA256(filePath) {
  // const fs = require("fs"); // REMOVED: Conflicting CommonJS require
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
