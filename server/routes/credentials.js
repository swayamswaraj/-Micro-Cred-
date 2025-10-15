// server/routes/credentials.js (FINAL DEBUGGED & ERROR-PROOF)
import express from "express";
import auth from "../middleware/auth.js";
import Credential from "../models/Credential.js";
import { upload } from "../middleware/upload.js";
import { extractText } from "../utils/ocr.js";
import { computeSHA256 } from "../utils/hash.js";
import { anchorHashOnBlockchain } from "../utils/blockchain.js";
import { calculateNSQF } from "../utils/nsqf.js";
import { verifyCertificateUrl } from "../utils/external_verification.js";
import { aiAnalyzeVerification } from "../utils/ai_verification.js";
import fs from "fs";
import path from "path";

const router = express.Router();

const SKILL_NSQF_MAP = {
  python: 5,
  javascript: 5,
  react: 6,
  "data science": 7,
  "machine learning": 8,
  management: 7,
  cloud: 6,
  cybersecurity: 8,
};

// GET route for fetching user credentials (Unchanged)
router.get("/", auth, async (req, res) => {
  try {
    const credentials = await Credential.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(credentials);
  } catch (err) {
    console.error("Error fetching credentials:", err);
    res.status(500).json({ error: "Internal server error during fetch" });
  }
});

// DELETE route for credentials
router.delete("/:id", auth, async (req, res) => {
  try {
    const credId = req.params.id;

    const cred = await Credential.findOneAndDelete({
      _id: credId,
      user: req.user._id,
    });

    if (!cred) {
      return res
        .status(404)
        .json({ message: "Credential not found or not owned by user." });
    }

    if (cred.filePath) {
      const filePath = path.join(process.cwd(), cred.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ ok: true, message: "Credential deleted successfully." });
  } catch (err) {
    console.error("Credential deletion error:", err);
    res
      .status(500)
      .json({ error: "Failed to delete credential due to server error." });
  }
});

// POST route for uploading and verifying credentials (AI integrated)
router.post("/", auth, upload.single("file"), async (req, res) => {
  let uploadedFilePath = null; // Track file path for cleanup if processing fails

  try {
    const {
      certificate_name,
      issuer,
      certificate_number,
      certificate_url,
      nsqf_level,
      skills: skillsRaw,
    } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    uploadedFilePath = file.path;

    // 1. OCR (Parsing)
    let text = "";
    try {
      text = await extractText(file.path);
    } catch (err) {
      console.error("OCR Extraction Failed:", err);
      text = ""; // Ensure text is empty string on failure
    }

    const textLower = (text || "").toLowerCase();

    let status = "pending";
    let verification_note = "Awaiting review.";

    // --- AI-POWERED VERIFICATION HIERARCHY ---
    if (!text || text.length < 50) {
      status = "rejected";
      verification_note = "Parsing failed or document unreadable (REJECTED).";
    } else {
      const aiInputs = { certificate_name, issuer, certificate_number };

      // --- STEP 1: AI Verification (Deep Text Analysis) ---
      let ai_match = false;
      let ai_reason = "AI check skipped/failed.";

      try {
        const aiResult = await aiAnalyzeVerification(text, aiInputs);
        ai_match = aiResult.ai_match;
        ai_reason = aiResult.ai_reason;
      } catch (err) {
        console.error("Gemini AI Verification failed:", err);
        ai_match = false; // Default to false if API fails
        ai_reason = "AI Verification API failed.";
      }

      verification_note = `AI Analysis: ${ai_reason}`;

      if (ai_match) {
        status = "verified"; // Tentatively verified by AI/LLM
        verification_note += " (Internal AI Match Confirmed)";

        // --- STEP 2: External URL Verification ---
        if (certificate_url) {
          try {
            const { urlStatus, urlNote } = await verifyCertificateUrl(
              certificate_url,
              certificate_name
            );
            verification_note += ` | URL Check: ${urlNote}`;

            if (urlStatus === "Verified") {
              status = "verified";
            } else if (urlStatus === "Rejected") {
              status = "pending";
              verification_note += " (Demoted due to failed URL validation).";
            }
          } catch (err) {
            console.error("External URL check failed:", err);
            verification_note += " | URL Check: Failed due to server error.";
            status = "pending"; // Demote on network failure
          }
        }
      } else {
        // AI analysis inconclusive or rejected inputs
        status = "pending";
        verification_note = `AI analysis inconclusive: ${ai_reason}. Requires manual review.`;
      }
    }
    // --- END VERIFICATION HIERARCHY ---

    // 3. Skills array & 4. NSQF (Using textLower)
    let skills = [];
    if (skillsRaw) {
      try {
        skills = JSON.parse(skillsRaw);
      } catch (e) {
        skills = (skillsRaw + "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } else {
      skills = Object.keys(SKILL_NSQF_MAP).filter((skill) =>
        textLower.includes(skill)
      );
    }

    let detectedLevel = nsqf_level ? Number(nsqf_level) : 1;
    for (const sk of skills) {
      const lvl = SKILL_NSQF_MAP[sk.toLowerCase()] || 1;
      if (lvl > detectedLevel) detectedLevel = lvl;
    }

    // 5. File hash & 6. Blockchain anchoring
    let file_hash = "";
    try {
      file_hash = computeSHA256(file.path);
    } catch {
      console.warn("Hashing failed.");
    }

    let blockchain_tx = null;
    try {
      const txResult = await anchorHashOnBlockchain(
        /*credentialId*/ file.filename,
        file_hash
      );
      blockchain_tx = txResult.txHash || txResult.transactionHash || txResult;
    } catch (err) {
      console.error("Blockchain anchoring failed:", err);
    }

    // 7. Save credential
    const cred = new Credential({
      user: req.user._id,
      certificate_name,
      issuer,
      certificate_number,
      certificate_url,
      file_url: `/uploads/${file.filename}`,
      filePath: uploadedFilePath,
      fileName: file.originalname,
      parsedText: text,
      status,
      skills,
      nsqfLevel: detectedLevel,
      file_hash,
      blockchain_tx,
      verification_note, // Save the detailed note
    });
    await cred.save();

    res.json({ ok: true, status, cred });
  } catch (err) {
    console.error("CRITICAL UPLOAD ERROR:", err);

    // CRITICAL FIX: If upload failed *after* saving file but *before* DB entry, clean up file
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.status(500).json({ error: "Server error" });
  }
});

export default router;
