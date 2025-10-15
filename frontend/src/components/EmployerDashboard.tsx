import { useEffect, useState } from "react";
import {
  Award,
  Search,
  LogOut,
  CheckCircle,
  User, // Required by StudentModal
  Globe, // Required by StudentModal
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiGetStudentsWithCredentials } from "../lib/api";

type Credential = {
  _id?: string;
  certificate_name?: string;
  issuer?: string;
  nsqf_level?: number;
  skills?: string[];
  certificate_url?: string;
  status?: string;
  verified?: boolean;
};

type SocialLinks = {
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
};

type Student = {
  profile?: {
    _id?: string;
    full_name?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    college?: string;
    branch?: string;
    bio?: string;
    projects?: any[];
    socials?: SocialLinks;
    [key: string]: any;
  };
  credentials?: Credential[];
  [key: string]: any;
};

// Define the API Base URL for constructing absolute paths to static files
const API_BASE_URL = "http://localhost:5000";

// StudentModal component
function StudentModal({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  // FIX: User and Globe are now correctly imported at the top level

  const profile = student.profile || {};
  const name = profile.full_name || profile.fullName || "Learner";
  const socials = profile.socials || {};
  const projects = profile.projects || [];
  const verifiedCount = (student.credentials || []).filter(
    (c) => c.status === "verified" || c.verified === true
  ).length;
  const avgNsqf = (() => {
    const arr = (student.credentials || [])
      .filter((c) => typeof c.nsqf_level === "number")
      .map((c) => c.nsqf_level || 0);
    if (!arr.length) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  })();

  // Construct absolute avatar URL for modal display
  const avatarSrc = profile.avatar
    ? profile.avatar.startsWith("http")
      ? profile.avatar
      : `${API_BASE_URL}${profile.avatar}`
    : "";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between z-10">
          {/* Modal Header */}
          <div className="flex items-center gap-4">
            <div>
              {/* Use constructed avatarSrc */}
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={name.charAt(0) + " Avatar"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-600">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="text-xl font-bold">{name}</div>
              <div className="text-sm text-gray-600">{profile.email}</div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {verifiedCount} verified
            </div>
            <button
              onClick={onClose}
              className="px-3 py-2 border rounded flex items-center gap-2 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-lg font-semibold">About</h4>
            <p className="text-gray-700 mt-2">
              {profile.bio || "No bio available."}
            </p>
          </div>
          {/* Projects Section */}
          <div>
            <h4 className="text-lg font-semibold">Projects</h4>
            <div className="mt-3 space-y-3">
              {projects.length === 0 ? (
                <div className="text-gray-600">No projects added.</div>
              ) : (
                projects.map((p: any, i: number) => (
                  <div key={i} className="border rounded p-3 bg-gray-50">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      {p.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Credentials Summary */}
          <div>
            <h4 className="text-lg font-semibold">
              Credentials ({verifiedCount} verified)
            </h4>
            {avgNsqf && (
              <p className="text-sm text-gray-600 mb-3">
                Average NSQF Level: {avgNsqf}
              </p>
            )}
            <div className="mt-3 grid gap-3">
              {(student.credentials || []).map((c, i) => (
                <div
                  key={c._id || i}
                  className="border rounded p-3 flex justify-between items-center bg-green-50/50"
                >
                  <div className="font-medium">{c.certificate_name}</div>
                  <div className="text-sm text-gray-600">
                    Issued by {c.issuer || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Social Links Section */}
          <div>
            <h4 className="text-lg font-semibold">Social Links</h4>
            <div className="flex gap-4 mt-3">
              {Object.entries(socials).map(
                ([platform, link]) =>
                  link && (
                    <a
                      key={platform}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {platform === "linkedin" && <Globe className="w-4 h-4" />}
                      {platform === "github" && <User className="w-4 h-4" />}
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmployerDashboard() {
  const { user, signOut } = useAuth() as any;
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchQuery, showOnlyVerified]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data: any = await apiGetStudentsWithCredentials();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let out = [...students];
    if (showOnlyVerified) {
      out = out.filter((st) =>
        (st.credentials || []).some(
          (c) => c.status === "verified" || c.verified === true
        )
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      out = out.filter((st) => {
        const name = (
          st.profile?.full_name ||
          st.profile?.fullName ||
          ""
        ).toLowerCase();
        const skills = (st.credentials || []).flatMap((c) => c.skills || []);
        const skillsMatch = skills.some((s) => s?.toLowerCase().includes(q));
        const credMatch = (st.credentials || []).some((c) =>
          (c.certificate_name || "").toLowerCase().includes(q)
        );
        return name.includes(q) || skillsMatch || credMatch;
      });
    }
    setFilteredStudents(out);
  };

  return (
    <div
      className="min-h-screen bg-gray-100 bg-cover bg-fixed"
      style={{
        backgroundImage: `url('/src/assets/images/digital-background.jpg')`,
      }}
    >
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-teal-600" />
            <div>
              <div className="text-lg font-bold text-gray-900">
                Micro-Cred Employer
              </div>
              <div className="text-sm text-gray-700">
                Discover verified talent
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700 font-medium">
              Welcome, {user?.fullName || user?.full_name || "Employer"}
            </div>
            <button
              onClick={signOut}
              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white shadow-text">
              Discover Talent
            </h1>
            <p className="text-sm text-gray-100 shadow-text">
              Search, filter and view learner profiles and credentials.
            </p>
          </div>
        </div>

        {/* Search and Filters Card - Frosted Glass Effect */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg mb-6 border border-white/20">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 w-full border border-gray-300 rounded-lg p-3 focus:ring-teal-500 focus:border-teal-500 bg-gray-50/50"
                placeholder="Search by name, skill or credential..."
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={showOnlyVerified}
                  onChange={() => setShowOnlyVerified((s) => !s)}
                  className="form-checkbox text-teal-600 rounded-sm"
                />
                <span>Show only verified</span>
              </label>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowOnlyVerified(false);
                }}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center text-white p-8 bg-black/50 rounded-xl">
              Loading talent profiles...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center text-gray-200 p-8 bg-black/50 rounded-xl">
              No learners found matching your criteria.
            </div>
          ) : (
            filteredStudents.map((st) => {
              const profile = st.profile || {};
              const primaryName =
                profile.full_name || profile.fullName || "Learner";
              const skills = Array.from(
                new Set((st.credentials || []).flatMap((c) => c.skills || []))
              ).slice(0, 5);
              const verifiedCount = (st.credentials || []).filter(
                (c) => c.status === "verified" || c.verified === true
              ).length;

              // Construct absolute avatar URL for list display
              const avatarSrc = profile.avatar
                ? profile.avatar.startsWith("http")
                  ? profile.avatar
                  : `${API_BASE_URL}${profile.avatar}`
                : "";

              return (
                <div
                  key={profile._id || profile.email}
                  className="bg-white/90 backdrop-blur-sm p-5 rounded-xl flex items-center justify-between transition-shadow hover:shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar/Placeholder */}
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={primaryName + " Avatar"}
                        className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-600">
                        {primaryName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-xl font-semibold text-gray-900">
                        {primaryName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {profile.college
                          ? `${profile.college} • ${profile.branch || ""}`
                          : profile.email}
                      </div>
                      <div className="mt-2 flex gap-2">
                        {skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-sm text-gray-700 text-center">
                      <span className="block font-semibold">
                        {(st.credentials || []).length}
                      </span>
                      <span className="block text-xs">Credentials</span>
                    </div>
                    <div className="text-sm text-green-700 flex items-center gap-1 font-semibold text-center">
                      <CheckCircle className="w-5 h-5" />
                      <span className="block">{verifiedCount} Verified</span>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(st)}
                      className="text-teal-600 border border-teal-500 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors shadow-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
