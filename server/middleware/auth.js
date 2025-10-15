// server/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default async function auth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.split(" ")[1];
    const token = bearer || req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // attach user to req.user
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
}
