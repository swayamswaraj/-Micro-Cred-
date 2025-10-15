// server/index.js (FINAL CLEANED AND FIXED)

import "dotenv/config";
import express from "express";
import cors from "cors"; // Consolidated: KEEP ONLY THIS ONE
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // Consolidated: KEEP ONLY THIS ONE

import authRoutes from "./routes/auth.js";
import credRoutes from "./routes/credentials.js";
import employerRoutes from "./routes/employer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CORS Configuration (Consolidated & Corrected) ---
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://micro-cred-b1g1.vercel.app";

app.use(
  cors({
    // FIX 1: Set the specific origin to allow credentials
    origin: FRONTEND_ORIGIN,
    // FIX 2: Allow all necessary methods
    methods: ["GET", "POST", "PUT", "DELETE"],
    // FIX 3: ESSENTIAL for sending cookies (solves your CORS error)
    credentials: true,
  })
);
// --- END CORS Configuration ---

// --- Middleware Setup (Order Matters) ---

// Built-in middleware
app.use(express.json()); // Body parser for JSON requests
app.use(cookieParser()); // Cookie parser middleware

// Static files (must be before routes if files are accessed via /uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes Setup ---

app.use("/api/auth", authRoutes);
app.use("/api/credentials", credRoutes);
app.use("/api/employer", employerRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ ok: true }));

// --- Database Connection and Server Start ---

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () =>
      // Use 5000 as default fallback
      console.log(
        `🚀 Server running on http://localhost:${process.env.PORT || 5000}`
      )
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
