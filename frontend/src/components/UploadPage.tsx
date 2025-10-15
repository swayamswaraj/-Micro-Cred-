import { useState } from "react";
import axios from "axios";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [issuer, setIssuer] = useState("");
  const [customIssuer, setCustomIssuer] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("issuer", issuer === "Other" ? customIssuer : issuer);

    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE}/credentials`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    setStatus(res.data.status);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Upload Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <select
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select issuer</option>
          <option value="University">University</option>
          <option value="Government">Government</option>
          <option value="Other">Other</option>
        </select>
        {issuer === "Other" && (
          <input
            type="text"
            placeholder="Enter issuer name"
            value={customIssuer}
            onChange={(e) => setCustomIssuer(e.target.value)}
            className="border p-2 rounded w-full"
          />
        )}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>
      {status && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          Status: <strong>{status}</strong>
        </div>
      )}
    </div>
  );
}
