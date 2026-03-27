import { useState } from "react";
import { Link } from "react-router";
import { Ship, Mail, ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password reset - in production this would call an API
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-[#0A192F] text-[#D4AF37] rounded-full flex items-center justify-center group-hover:bg-[#0A192F]/90 transition-colors">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0A192F] uppercase">
              Oceana<span className="text-[#D4AF37]">Lux</span>
            </span>
          </Link>
          <h1 className="text-3xl font-light text-[#0A192F] mb-2">Reset Password</h1>
          <p className="text-slate-600">
            {isSubmitted 
              ? "Check your email for reset instructions"
              : "Enter your email to receive a password reset link"
            }
          </p>
        </div>

        {/* Form or Success Message */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-6 bg-[#0A192F] text-white rounded-lg hover:bg-[#0A192F]/90 transition-all shadow-md font-medium"
              >
                Send Reset Link
              </button>

              {/* Back to Login */}
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-[#0A192F] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-2 font-medium">Didn't receive the email?</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Check your spam or junk folder
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Make sure you entered the correct email
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Wait a few minutes and check again
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-3 px-6 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Try Different Email
                </button>
                <Link 
                  to="/login" 
                  className="w-full py-3 px-6 bg-[#0A192F] text-white rounded-lg hover:bg-[#0A192F]/90 transition-all shadow-md font-medium text-center"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help?{" "}
            <a href="#" className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
