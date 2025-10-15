import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { EmployerDashboard } from "./components/EmployerDashboard";

function AppContent() {
  const { user, loading, signIn, signUp } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    if (showAuth)
      return (
        <AuthPage
          onBack={() => setShowAuth(false)}
          onLogin={async (email, password) => await signIn(email, password)}
          onSignUp={async (email, password, fullName, role) => {
            await signUp(email, password, fullName, role);
            alert("Registered successfully. Please login.");
            navigate("/");
          }}
        />
      );
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  if (user.role === "student") return <StudentDashboard />;
  if (user.role === "employer") return <EmployerDashboard />;
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
