import React, { useEffect, useState } from "react";
import {
  Award,
  Upload,
  User,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Edit3,
  Github,
  Linkedin,
  Image,
  Twitter,
  Save,
  X,
  PlusCircle,
  Instagram,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  apiGetCredentials,
  apiDeleteCredential,
  apiUpdateProfile,
  apiPostCredentialMultipart,
  apiGetProfile,
} from "../lib/api";

type View = "dashboard" | "upload" | "profile";

interface Credential {
  id: string;
  user?: string;
  certificate_name: string;
  issuer?: string;
  status?: "pending" | "verified" | "invalid" | string;
  nsqf_level?: number | null;
  skills?: string[];
  created_at?: string;
}

interface Project {
  title: string;
  description: string;
  github?: string;
  liveDemo?: string;
}

interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
}

interface ProfileData {
  avatar?: string;
  fullName?: string;
  college?: string;
  branch?: string;
  bio?: string;
  projects?: Project[];
  socials?: SocialLinks;
}

const SKILL_NSQF_MAP: { [key: string]: number } = {
  python: 5,
  javascript: 5,
  react: 6,
  "data science": 7,
  "machine learning": 8,
  management: 7,
  cloud: 6,
  cybersecurity: 8,
};

const API_BASE_URL = "http://localhost:5000";

async function apiDeleteAvatar() {
  return fetch(`${API_BASE_URL}/api/auth/avatar`, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to delete avatar on server.");
    return res.json();
  });
}

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const [profile, setProfile] = useState<ProfileData>({
    avatar: "",
    fullName: user?.fullName || "",
    college: "",
    branch: "",
    bio: "",
    projects: [],
    socials: {},
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [nsqfLevelInput, setNsqfLevelInput] = useState<number | "">("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // FIX: New state to manage the temporary preview URL during editing
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // --- Utility Functions ---

  const fetchCredentials = async () => {
    try {
      const data: Credential[] = await apiGetCredentials();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    }
  };

  const fetchProfileDetails = async () => {
    if (user) {
      try {
        const fullProfile: any = await apiGetProfile();

        if (fullProfile) {
          setProfile({
            avatar: fullProfile.avatar || "",
            fullName:
              fullProfile.fullName || fullProfile.full_name || user.fullName,
            college: fullProfile.college || "",
            branch: fullProfile.branch || "",
            bio: fullProfile.bio || "",
            projects: (fullProfile.projects as Project[]) || [],
            socials: (fullProfile.socials as SocialLinks) || {},
          });
          // Clear preview state once permanent data is loaded
          setAvatarPreview(null);
        }
      } catch (err) {
        console.error("Failed to fetch full profile details:", err);
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your avatar?"
      )
    )
      return;
    try {
      await apiDeleteAvatar();

      setProfile((prev) => ({ ...prev, avatar: "" }));
      setAvatarFile(null);
      setAvatarPreview(null); // Clear preview too

      alert("Avatar deleted successfully.");
    } catch (err) {
      console.error("Avatar deletion failed:", err);
      alert("Failed to delete avatar.");
    }
  };

  // FIX: Handles file change for preview and upload queue
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url); // Set new preview URL
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this credential?"))
      return;
    try {
      await apiDeleteCredential(id);
      fetchCredentials();
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Failed to delete credential.");
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !certName || !certIssuer || !certNumber)
      return alert("Please fill all required fields and select a file.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("certificate_name", certName);
    formData.append("issuer", certIssuer);
    formData.append("certificate_number", certNumber);
    if (certUrl) formData.append("certificate_url", certUrl);
    if (nsqfLevelInput) formData.append("nsqf_level", String(nsqfLevelInput));

    try {
      await apiPostCredentialMultipart(formData);
      alert("Credential uploaded successfully! Status set to pending.");
      setUploadFile(null);
      setCertName("");
      setCertIssuer("");
      setCertNumber("");
      setCertUrl("");
      setNsqfLevelInput("");
      setView("dashboard");
    } catch (err) {
      console.error("Upload failed:", err);
      alert(
        `Credential upload failed: Error: ${
          (err as Error).message || "Server error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (status: Credential["status"]) => {
    const s = status ?? "";
    if (s.length > 0) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return "N/A";
  };

  const getStatusIcon = (status: Credential["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value },
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const isFileUpdate = !!avatarFile;
      let payload: FormData | ProfileData;

      if (isFileUpdate) {
        payload = new FormData();
        const data = { ...profile };

        (payload as FormData).append("avatar", avatarFile!);

        Object.entries(data).forEach(([key, value]) => {
          if (key !== "avatar") {
            (payload as FormData).append(
              key,
              typeof value === "object" ? JSON.stringify(value) : value
            );
          }
        });
      } else {
        payload = profile;
      }

      await apiUpdateProfile(payload);

      setEditing(false);
      setAvatarFile(null);
      await fetchProfileDetails(); // Crucial: Fetch fresh data to get the permanent URL

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // --- Hooks ---
  useEffect(() => {
    fetchCredentials();
    fetchProfileDetails();
  }, [user, view]);

  // --- Avatar Logic ---
  // FIX: This URL is used only for display outside of edit mode and for the view link.
  const permanentAvatarSrc = profile.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${API_BASE_URL}${profile.avatar}`
    : "";

  // Determine which source to display: temporary preview or permanent server path
  const currentAvatarDisplaySrc = avatarPreview || permanentAvatarSrc;

  // --- JSX Rendering ---

  return (
    // Conditional background style based on view:
    <div
      className="min-h-screen bg-gray-100 bg-cover bg-fixed"
      style={{
        backgroundImage:
          view === "dashboard"
            ? `url('/src/assets/images/digital-background.jpg')`
            : "none",
        backgroundColor:
          view === "upload" || view === "profile" ? "#f9fafb" : "",
      }}
    >
      {/* Navbar with transparency (Frosted Glass Effect) */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Micro-Cred</span>
          </div>
          <div className="flex items-center space-x-6">
            {["dashboard", "upload", "profile"].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab as View)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  view === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="max-w-5xl mx-auto py-8 px-4 relative z-10">
        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-6 border border-white/20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <Award className="w-8 h-8 text-blue-600" />
              <span>My Credentials</span>
            </h2>
            {credentials.length === 0 ? (
              <div className="text-gray-600 text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">
                  You haven't uploaded any credentials yet.
                </p>
                <p className="text-sm mt-2">
                  Start by navigating to the "Upload" tab!
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {credentials.map((cred) => (
                  <li
                    key={cred.id}
                    className="bg-blue-50/50 backdrop-blur-sm border border-blue-200 p-5 rounded-xl flex justify-between items-center transition-transform hover:scale-[1.01] hover:shadow-md duration-200"
                  >
                    <div>
                      <div className="font-semibold text-xl text-gray-900">
                        {cred.certificate_name}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        Issuer: {cred.issuer || "N/A"}
                      </div>
                      <div className="text-sm flex items-center space-x-2 mt-2">
                        {getStatusIcon(cred.status)}
                        <span className="font-medium text-gray-800">
                          Status: {getDisplayStatus(cred.status)}
                        </span>
                        {cred.nsqf_level && (
                          <span className="ml-4 px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                            NSQF Level {cred.nsqf_level}
                          </span>
                        )}
                      </div>
                      {cred.skills && cred.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cred.skills.map((skill, sIdx) => (
                            <span
                              key={`${cred.id}-skill-${sIdx}`}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDeleteCredential(cred.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete Credential"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* UPLOAD VIEW (Clean White Background) */}
        {view === "upload" && (
          <form
            onSubmit={handleUploadFile}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <Upload className="w-8 h-8 text-blue-600" />
              <span>Upload New Credential</span>
            </h2>

            <input
              type="text"
              placeholder="Certificate Name (e.g., Python Basics Certification)"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
            <input
              type="text"
              placeholder="Issuing Organization (e.g., Coursera, Udemy)"
              value={certIssuer}
              onChange={(e) => setCertIssuer(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              placeholder="Certificate Number (e.g., 12345ABC)"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="url"
              placeholder="Certificate URL (Optional verification link)"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {/* NSQF Level Input */}
            <select
              value={nsqfLevelInput}
              onChange={(e) =>
                setNsqfLevelInput(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select NSQF Level (Optional)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>

            {/* File Upload Area */}
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-blue-400 p-10 text-center text-gray-600 rounded-lg bg-blue-50/50 hover:bg-blue-100/70 transition-colors duration-200">
                <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <p className="text-lg font-medium">
                  {uploadFile
                    ? `File selected: ${uploadFile.name}`
                    : "Drag & Drop or Click to Select File (PDF/Image)"}
                </p>
                <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*, application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                required
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !uploadFile}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
            >
              {loading
                ? "Uploading & Verifying..."
                : "Upload & Verify Credential"}
            </button>

            {/* NSQF Level Information in footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <h4 className="font-semibold mb-2">About NSQF Levels:</h4>
              <p className="mb-2">
                The National Skills Qualifications Framework (NSQF) organizes
                qualifications by levels of knowledge, skills, and aptitude.
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(SKILL_NSQF_MAP)
                  .sort(([, levelA], [, levelB]) => levelA - levelB)
                  .map(([skill, level]) => (
                    <li key={skill} className="bg-gray-100 p-2 rounded-md">
                      <span className="font-medium text-gray-800 capitalize">
                        {skill}:
                      </span>{" "}
                      Level {level}
                    </li>
                  ))}
                <li className="col-span-full text-xs text-gray-500 mt-2">
                  *System can auto-detect NSQF levels for listed skills in
                  uploaded documents.
                </li>
              </ul>
            </div>
          </form>
        )}

        {/* PROFILE VIEW (Clean White Background) */}
        {view === "profile" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <span>My Profile</span>
            </h2>

            {/* Profile Header (Avatar and Name) */}
            <div className="flex items-center space-x-6 pb-6 border-b border-gray-200">
              <div className="relative group">
                {/* Use the correct display source (Preview or Permanent) */}
                {currentAvatarDisplaySrc ? (
                  <img
                    src={currentAvatarDisplaySrc}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-300 group-hover:border-blue-500 transition-colors"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-5xl font-bold text-blue-600 border-4 border-blue-300 group-hover:border-blue-500 transition-colors">
                    {profile.fullName?.charAt(0) || (
                      <User className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Avatar Controls (Visible when Editing) */}
              {editing && (
                <div className="flex flex-col space-y-2 text-sm pt-4">
                  <label className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 cursor-pointer transition-colors">
                    <Edit3 className="w-4 h-4" />
                    <span>Update Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* FIX: Use permanentAvatarSrc for view/delete buttons */}
                  {permanentAvatarSrc && (
                    <>
                      <a
                        href={permanentAvatarSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        <span>View Current</span>
                      </a>
                      <button
                        onClick={handleDeleteAvatar}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Avatar</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              <div>
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) =>
                        handleProfileChange("fullName", e.target.value)
                      }
                      placeholder="Full Name"
                      className="block w-full border rounded-lg p-2 mb-2 bg-gray-50/50"
                    />
                    <input
                      type="text"
                      value={profile.college}
                      onChange={(e) =>
                        handleProfileChange("college", e.target.value)
                      }
                      placeholder="College"
                      className="block w-full border rounded-lg p-2 mb-2 bg-gray-50/50"
                    />
                    <input
                      type="text"
                      value={profile.branch}
                      onChange={(e) =>
                        handleProfileChange("branch", e.target.value)
                      }
                      placeholder="Branch"
                      className="block w-full border rounded-lg p-2 bg-gray-50/50"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {profile.fullName}
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {profile.college} • {profile.branch}
                    </p>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-3 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="pt-4">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                About Me
              </h4>
              {editing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={4}
                  className="w-full border rounded-lg p-3 mt-2 bg-gray-50/50"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700 mt-2 leading-relaxed">
                  {profile.bio ||
                    "No bio added yet. Click 'Edit Profile' to add one!"}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Projects
              </h4>
              {profile.projects?.length === 0 && !editing ? (
                <p className="text-gray-600">No projects added yet.</p>
              ) : (
                profile.projects?.map((proj, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 mt-3 shadow-sm"
                  >
                    {editing ? (
                      <>
                        <input
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...(profile.projects || [])];
                            updated[idx].title = e.target.value;
                            handleProfileChange("projects", updated);
                          }}
                          className="block w-full border rounded-lg p-2 mb-2 bg-white/70"
                          placeholder="Project Title"
                        />
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...(profile.projects || [])];
                            updated[idx].description = e.target.value;
                            handleProfileChange("projects", updated);
                          }}
                          className="block w-full border rounded-lg p-2 mb-2 bg-white/70"
                          placeholder="Project Description"
                          rows={3}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            value={proj.github}
                            onChange={(e) => {
                              const updated = [...(profile.projects || [])];
                              updated[idx].github = e.target.value;
                              handleProfileChange("projects", updated);
                            }}
                            placeholder="GitHub URL"
                            className="border rounded-lg p-2 bg-white/70"
                          />
                          <input
                            value={proj.liveDemo}
                            onChange={(e) => {
                              const updated = [...(profile.projects || [])];
                              updated[idx].liveDemo = e.target.value;
                              handleProfileChange("projects", updated);
                            }}
                            placeholder="Live Demo URL"
                            className="border rounded-lg p-2 bg-white/70"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = (profile.projects || []).filter(
                              (_, i) => i !== idx
                            );
                            handleProfileChange("projects", updated);
                          }}
                          className="mt-3 flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Project</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <h5 className="font-semibold text-lg text-gray-900">
                          {proj.title}
                        </h5>
                        <p className="text-gray-700 mb-2 text-sm">
                          {proj.description}
                        </p>
                        <div className="flex gap-4 text-blue-600 text-sm">
                          {proj.github && (
                            <a
                              href={proj.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:underline hover:text-blue-800"
                            >
                              <Github className="w-4 h-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {proj.liveDemo && (
                            <a
                              href={proj.liveDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:underline hover:text-blue-800"
                            >
                              <span>Live Demo</span>
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
              {editing && (
                <button
                  onClick={() =>
                    handleProfileChange("projects", [
                      ...(profile.projects || []),
                      { title: "", description: "" },
                    ])
                  }
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Project</span>
                </button>
              )}
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Social Links
              </h4>
              <div className="flex flex-wrap gap-3 mt-3">
                {["github", "linkedin", "instagram", "twitter"].map((p) => {
                  const iconMap: any = {
                    github: Github,
                    linkedin: Linkedin,
                    instagram: Instagram,
                    twitter: Twitter,
                  };
                  const Icon = iconMap[p];
                  return editing ? (
                    <input
                      key={p}
                      type="text"
                      placeholder={`${p} URL`}
                      value={(profile.socials as any)[p] || ""}
                      onChange={(e) =>
                        handleSocialChange(p as any, e.target.value)
                      }
                      className="border rounded-lg p-2 w-64 bg-gray-50/50"
                    />
                  ) : (
                    (profile.socials as any)[p] && (
                      <a
                        key={p}
                        href={(profile.socials as any)[p]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="capitalize">{p}</span>
                      </a>
                    )
                  );
                })}
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {editing && (
              <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
                  disabled={loading}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
