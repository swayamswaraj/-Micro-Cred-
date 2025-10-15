// server/models/User.js (FIXED with Employer Fields)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "employer"], required: true },

  // --- NEW EMPLOYER FIELDS ---
  employerId: String, // Company-specific ID or registration number
  organization: String, // Company name
  post: String, // Job title (CEO, HR, Owner)
  // --- END NEW FIELDS ---

  // Additional Student Profile Fields (used by StudentDashboard)
  college: String,
  branch: String,
  bio: String,
  projects: Array,
  socials: Object,
  avatar: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
