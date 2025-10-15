import { useState } from "react";
import { Award, ArrowLeft, UserCircle, Building2 } from "lucide-react";

interface AuthPageProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (data: Record<string, any>) => Promise<any>; // Returns promise response
}

type AuthView =
  | "main"
  | "login"
  | "signup-role"
  | "signup-student"
  | "signup-employer";

export function AuthPage({ onBack, onLogin, onSignUp }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [employerId, setEmployerId] = useState("");
  const [organization, setOrganization] = useState("");
  const [post, setPost] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      // FIX: Use optional chaining to safely extract server message
      const errorMessage =
        err.message ||
        err.response?.data?.message ||
        "Failed to sign in. Please check credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    e: React.FormEvent,
    role: "student" | "employer"
  ) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const data: Record<string, any> = { email, password, fullName, role };

    // CRITICAL FIX: Client-side validation for employer fields
    if (role === "employer") {
      if (!organization || !post) {
        setError("Organization Name and Your Post are required.");
        return;
      }
      data.employerId = employerId;
      data.organization = organization;
      data.post = post;
    }

    setLoading(true);

    try {
      // The server response will contain a 'message' if successful or failed (400)
      const res = await onSignUp(data);

      // FIX: Use optional chaining or safe check for message property
      alert(res?.message || "Registration successful! Please log in.");
      setEmail(email);
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      setView("login");
    } catch (err: any) {
      // CAPTURES SERVER 400 ERROR RESPONSE MESSAGES (e.g., "User already exists")
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create account. Please check your data.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (view === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students learning"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-2xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-3 mb-8">
              <Award className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
            </div>

            <p className="text-gray-600 mb-8">Choose an option to continue</p>

            <div className="space-y-4">
              <button
                onClick={() => setView("login")}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Login
              </button>

              <button
                onClick={() => setView("signup-role")}
                className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold hover:bg-teal-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => setView("main")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <p className="text-gray-600 mb-8">
            Welcome back! Please enter your details.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "signup-role") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => setView("main")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-gray-600 mb-8">Choose your account type</p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setView("signup-student")}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 hover:border-blue-500 transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              <UserCircle className="w-16 h-16 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Student</h3>
              <p className="text-gray-600">
                Create a profile to showcase your credentials and skills
              </p>
            </button>

            <button
              onClick={() => setView("signup-employer")}
              className="group bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl p-8 hover:border-teal-500 transition-all transform hover:-translate-y-1 hover:shadow-xl"
            >
              <Building2 className="w-16 h-16 text-teal-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Employer
              </h3>
              <p className="text-gray-600">
                Find and verify talented professionals with proven credentials
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStudentSignup = view === "signup-student";
  const role = isStudentSignup ? "student" : "employer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={() => setView("signup-role")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3 mb-6">
          {isStudentSignup ? (
            <UserCircle className="w-10 h-10 text-blue-600" />
          ) : (
            <Building2 className="w-10 h-10 text-teal-600" />
          )}
          <h2 className="text-3xl font-bold text-gray-900">
            {isStudentSignup ? "Student" : "Employer"} Sign Up
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSignUp(e, role)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          {!isStudentSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name (Company)
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Post/Title (CEO, HR, etc.)
                </label>
                <input
                  type="text"
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="HR Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company ID / Reg. No. (Optional)
                </label>
                <input
                  type="text"
                  value={employerId}
                  onChange={(e) => setEmployerId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="OPTIONAL: E.g., 98765"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              isStudentSignup
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-teal-600 hover:bg-teal-700"
            } text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
