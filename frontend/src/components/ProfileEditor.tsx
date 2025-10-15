// src/components/ProfileEditor.tsx (FIXED)
import { useState, useEffect } from "react";
import { Save } from "lucide-react"; // Removed X and Upload
import { apiUpdateProfile } from "../lib/api";

type Project = {
  title?: string;
  description?: string;
  github?: string;
  liveDemo?: string;
};

type Socials = {
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
};

export default function ProfileEditor({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: any;
  onSaved?: (newProfile: any) => void;
  onCancel?: () => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initial?.avatar || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(
    initial?.fullName || initial?.full_name || ""
  );
  const [college, setCollege] = useState(initial?.college || "");
  const [branch, setBranch] = useState(initial?.branch || "");
  const [bio, setBio] = useState(initial?.bio || "");
  const [projects, setProjects] = useState<Project[]>(initial?.projects || []);
  const [socials, setSocials] = useState<Socials>(initial?.socials || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjects(initial?.projects || []);
    setSocials(initial?.socials || {});
  }, [initial]);

  const handleFile = (f?: File | null) => {
    if (!f) return;
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  };

  const addProject = () => {
    setProjects((p) => [...p, { title: "", description: "" }]);
  };
  const removeProject = (idx: number) => {
    setProjects((p) => p.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setLoading(true);
    try {
      // If avatarFile present -> use FormData
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        fd.append("fullName", fullName);
        fd.append("college", college || "");
        fd.append("branch", branch || "");
        fd.append("bio", bio || "");
        fd.append("projects", JSON.stringify(projects || []));
        fd.append("socials", JSON.stringify(socials || {}));
        const res = await apiUpdateProfile(fd);
        onSaved?.(res);
        return;
      }
      // else JSON
      const payload = {
        fullName,
        college,
        branch,
        bio,
        projects,
        socials,
      };
      const res = await apiUpdateProfile(payload);
      onSaved?.(res);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      alert(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-start gap-6">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600">
              U
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="flex-1 space-y-2">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Full name"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="border rounded p-2"
              placeholder="College"
            />
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="border rounded p-2"
              placeholder="Branch"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full border rounded p-2"
          placeholder="Add a short bio"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Projects</h4>
          <button onClick={addProject} className="text-sm text-blue-600">
            + Add project
          </button>
        </div>
        <div className="space-y-3 mt-3">
          {projects.map((proj, idx) => (
            <div key={idx} className="border p-3 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <input
                    value={proj.title || ""}
                    onChange={(e) => {
                      const copy = [...projects];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      setProjects(copy);
                    }}
                    placeholder="Project title"
                    className="w-full border rounded p-2"
                  />
                  <textarea
                    value={proj.description || ""}
                    onChange={(e) => {
                      const copy = [...projects];
                      copy[idx] = { ...copy[idx], description: e.target.value };
                      setProjects(copy);
                    }}
                    rows={2}
                    className="w-full border rounded p-2 mt-2"
                    placeholder="Short description"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      value={proj.github || ""}
                      onChange={(e) => {
                        const copy = [...projects];
                        copy[idx] = { ...copy[idx], github: e.target.value };
                        setProjects(copy);
                      }}
                      placeholder="GitHub URL"
                      className="border rounded p-2"
                    />
                    <input
                      value={proj.liveDemo || ""}
                      onChange={(e) => {
                        const copy = [...projects];
                        copy[idx] = { ...copy[idx], liveDemo: e.target.value };
                        setProjects(copy);
                      }}
                      placeholder="Live demo URL"
                      className="border rounded p-2"
                    />
                  </div>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => removeProject(idx)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Social Links</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="GitHub URL"
            value={socials.github || ""}
            onChange={(e) =>
              setSocials((s) => ({ ...s, github: e.target.value }))
            }
            className="border rounded p-2"
          />
          <input
            placeholder="LinkedIn URL"
            value={socials.linkedin || ""}
            onChange={(e) =>
              setSocials((s) => ({ ...s, linkedin: e.target.value }))
            }
            className="border rounded p-2"
          />
          <input
            placeholder="Instagram URL"
            value={socials.instagram || ""}
            onChange={(e) =>
              setSocials((s) => ({ ...s, instagram: e.target.value }))
            }
            className="border rounded p-2"
          />
          <input
            placeholder="Twitter/X URL"
            value={socials.twitter || ""}
            onChange={(e) =>
              setSocials((s) => ({ ...s, twitter: e.target.value }))
            }
            className="border rounded p-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save profile"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
