"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Music, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      setVerifying(false);
      return;
    }

    // Verify token on mount
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`/api/auth/reset-password?token=${token}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setTokenValid(true);
        setEmail(data.email);
      } else {
        setError(data.error || "This reset link is invalid or has expired.");
      }
    } catch (err) {
      setError("Failed to verify reset link. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 3000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {verifying ? (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
              <Music className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {error || "This password reset link is invalid or has expired."}
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="block w-full bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-gray-600 hover:text-primary-600 px-6 py-3 rounded-lg font-medium transition"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page...
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Lock className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Reset Your Password</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Enter a new password for <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">At least 6 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white hover:bg-primary-700 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-primary-600 text-sm font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
            <Music className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

