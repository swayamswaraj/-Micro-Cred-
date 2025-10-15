// server/routes/auth.js (FINAL FIX: Specific Error Messages)
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import fs from "fs";
import path from "path";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

function createToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

// -----------------------------------------------------------
// 1. REGISTER ROUTE
// -----------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, role, employerId, organization, post } =
      req.body;

    // FIX 1: Explicitly return specific message for missing required fields
    if (!email || !password || !fullName || !role)
      return res
        .status(400)
        .json({
          message: "All general fields (email, password, name) are required.",
        });

    if (role === "employer" && (!organization || !post))
      return res.status(400).json({
        message:
          "Organization Name and Post/Title are required for employer accounts.",
      });

    const existing = await User.findOne({ email });
    // FIX 2: Specific message for existing user
    if (existing)
      return res
        .status(400)
        .json({ message: "User already exists with this email." });

    const user = new User({
      email,
      password,
      fullName,
      role,
      employerId,
      organization,
      post,
    });
    await user.save();

    res.status(201).json({
      ok: true,
      message: "Registration successful. Please log in.",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// -----------------------------------------------------------
// 2. LOGIN ROUTE
// -----------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // FIX 3: Specific message for user not found
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid credentials: User not found." });

    const match = await bcrypt.compare(password, user.password);
    // FIX 4: Specific message for incorrect password
    if (!match)
      return res
        .status(400)
        .json({ message: "Invalid credentials: Incorrect password." });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        post: user.post,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// -----------------------------------------------------------
// 3. PROFILE FETCH ROUTE
// -----------------------------------------------------------
router.get("/profile", async (req, res) => {
  try {
    // Safer token extraction
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
      req.cookies?.token;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile route error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

// -----------------------------------------------------------
// 4. PROFILE UPDATE ROUTE
// -----------------------------------------------------------
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body || {};

      const doc = {};
      const allowed = [
        "fullName",
        "college",
        "branch",
        "bio",
        "projects",
        "socials",
        "organization",
        "post",
        "employerId",
      ];

      for (const k of allowed) {
        if (k in updates) {
          if (
            typeof updates[k] === "string" &&
            (k === "projects" || k === "socials")
          ) {
            try {
              doc[k] = JSON.parse(updates[k]);
            } catch {
              doc[k] = updates[k];
            }
          } else {
            doc[k] = updates[k];
          }
        }
      }

      if (req.file && req.file.path) {
        const avatarUrl = `/uploads/${req.file.filename}`;
        doc.avatar = avatarUrl;

        const oldUser = await User.findById(userId);
        if (oldUser?.avatar && oldUser.avatar.startsWith("/uploads/")) {
          const oldFilePath = path.join(
            UPLOAD_DIR,
            path.basename(oldUser.avatar)
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: doc },
        { new: true }
      ).select("-password");

      return res.json(user);
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ message: "Server error during profile update" });
    }
  }
);

// -----------------------------------------------------------
// 5. DELETE AVATAR ROUTE
// -----------------------------------------------------------
router.delete("/avatar", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const oldAvatarPath = user.avatar;

    if (oldAvatarPath && oldAvatarPath.startsWith("/uploads/")) {
      const filePath = path.join(UPLOAD_DIR, path.basename(oldAvatarPath));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete file from server disk
      }
    }

    user.avatar = null;
    await user.save();

    res.json({ ok: true, message: "Avatar deleted." });
  } catch (err) {
    console.error("Avatar deletion API error:", err);
    res.status(500).json({ message: "Failed to delete avatar." });
  }
});

// -----------------------------------------------------------
// 6. LOGOUT ROUTE
// -----------------------------------------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
