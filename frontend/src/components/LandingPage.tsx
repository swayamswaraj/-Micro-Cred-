import { Award, Shield, Users, ArrowRight, Zap, Cloud } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Micro-Cred Aggregator
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                About
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#future-scope" // NEW: Added link to future scope
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Future Scope
              </a>
              <button
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Unify Your Learning Credentials in One Place
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Collect, verify, and showcase all your micro-credentials
                securely. Build a comprehensive professional profile that stands
                out.
              </p>
              <button
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Hero Visuals / Stats Block */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                    <Award className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        45+ Credentials
                      </div>
                      <div className="text-sm text-gray-600">
                        Verified & Stored
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-teal-50 p-4 rounded-lg">
                    <Shield className="w-8 h-8 text-teal-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        100% Verified
                      </div>
                      <div className="text-sm text-gray-600">
                        Blockchain Secured
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-amber-50 p-4 rounded-lg">
                    <Users className="w-8 h-8 text-amber-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        500+ Employers
                      </div>
                      <div className="text-sm text-gray-600">
                        Trust Our Platform
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About Micro-Cred Aggregator
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing how professionals showcase their skills and
              how employers discover talent through verified micro-credentials.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage and showcase your credentials
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Unified Profile
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Aggregate all your certificates from Coursera, Udemy,
                DigiLocker, and more into one comprehensive profile.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-teal-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Verified Credentials
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automatic verification ensures authenticity. NSQF level mapping
                helps employers understand your skill levels.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-amber-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Employer Access
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Employers can search, filter, and discover talent based on
                verified skills and credentials with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Future Scope Section (Based on Screenshot) */}
      <section id="future-scope" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Future Scope
            </h2>
            <p className="text-xl text-gray-600">
              Our vision for continuous development and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Future Scope 1: Blockchain Verification */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-teal-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Blockchain Verification
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ensure tamper-proof credential verification with blockchain
                technology for maximum security and trust.
              </p>
            </div>

            {/* Future Scope 2: Integration with DigiLocker */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Cloud className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Integration with DigiLocker
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get credentials officially recognized via DigiLocker integration
                for streamlined government and educational acceptance.
              </p>
            </div>

            {/* Future Scope 3: AI-Powered Skill Analytics */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-pink-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Powered Skill Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Suggest personalized learning paths and career recommendations
                based on skills already acquired and market demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-6 h-6" />
                <span className="text-lg font-bold">Micro-Cred Aggregator</span>
              </div>
              <p className="text-gray-400">
                Empowering learners and employers with verified
                micro-credentials.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#future-scope"
                    className="hover:text-white transition-colors"
                  >
                    Future Scope
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">
                Email: sm4596932@gmail.com
                <br />
                Support: sm4596932@gmail.com
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Micro-Cred Aggregator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
