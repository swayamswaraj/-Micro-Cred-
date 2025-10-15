import Tesseract from "tesseract.js";
import fs from "fs";

/**
 * Extract text from image or PDF file.
 */
export async function extractText(filePath) {
  const ext = filePath.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    // dynamically import pdf-parse (CommonJS)
    const pdf = await import("pdf-parse").then((mod) => mod.default || mod);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } else {
    const result = await Tesseract.recognize(filePath, "eng");
    return result.data.text;
  }
}
