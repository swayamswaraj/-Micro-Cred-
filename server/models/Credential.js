import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  certificate_name: String,
  issuer: String,
  certificate_number: String,
  file_url: String, // path to uploaded file (served by static)
  filePath: String, // server side path if needed
  fileName: String,
  file_hash: String, // sha256 of file
  blockchain_tx: String, // tx hash returned from anchor
  parsedText: String,
  status: {
    type: String,
    enum: ["verified", "pending", "rejected"],
    default: "pending",
  },
  skills: [String],
  nsqfLevel: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Credential", credentialSchema);
