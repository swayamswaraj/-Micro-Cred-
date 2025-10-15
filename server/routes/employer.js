// server/routes/employer.js (FINAL FIX)
import express from "express";
import Credential from "../models/Credential.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /students route (mounted under /api/employer)
router.get("/students", auth, async (req, res) => {
  try {
    // SECURITY CHECK: Ensure only employers can access this route
    if (req.user.role !== "employer") {
      // Return 403 Forbidden if not an employer
      return res
        .status(403)
        .json({
          message: "Access denied. Only employers can view student lists.",
        });
    }

    // fetch all students
    const students = await User.find({ role: "student" })
      .select("-password")
      .lean();

    // gather credentials grouped by user
    const userIds = students.map((s) => s._id);
    const creds = await Credential.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .lean();

    const credsByUser = creds.reduce((acc, c) => {
      const uid = String(c.user);
      acc[uid] = acc[uid] || [];
      acc[uid].push(c);
      return acc;
    }, {});

    const out = students.map((s) => ({
      // Note: 's' contains all profile and employer data, but employer data will be empty for students
      profile: s,
      credentials: credsByUser[String(s._id)] || [],
    }));

    res.json(out);
  } catch (err) {
    console.error("Employer student fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
