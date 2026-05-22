"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// Helper to get reCAPTCHA Enterprise token
const executeRecaptchaEnterprise = (action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const grecaptcha = (window as any).grecaptcha;
    if (grecaptcha && grecaptcha.enterprise) {
      grecaptcha.enterprise.ready(async () => {
        try {
          const token = await grecaptcha.enterprise.execute('6LcywOosAAAAADkVVsf9vSvXHVAIcELib2rrBWJK', { action });
          resolve(token);
        } catch (err) {
          reject(err);
        }
      });
    } else {
      reject(new Error("reCAPTCHA Enterprise not loaded"));
    }
  });
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP, 3: Forgot Pass Email, 4: Reset Pass
  const [formData, setFormData] = useState({ email: "", password: "", newPassword: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/menu");
    }
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Execute reCAPTCHA Enterprise
      let captchaToken;
      try {
        captchaToken = await executeRecaptchaEnterprise("login");
      } catch (err) {
        throw new Error("Security check failed to load. Please refresh and try again.");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setStep(2);
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error("Failed to resend OTP");
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Save token and role to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);

      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.role === "delivery_boy") {
        router.push("/delivery");
      } else {
        router.push("/menu");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");

      setStep(4);
      setSuccess("Reset code sent to your registered email/phone");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setStep(1);
      setSuccess("Password reset successful. Please login.");
      setFormData({ ...formData, password: "", newPassword: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--gold-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--gold-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[var(--surface-dark)] p-8 md:p-10 border border-[var(--surface-border)] rounded-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif text-white mb-2">
                {step === 1 && "Welcome Back"}
                {step === 2 && "Security Check"}
                {step === 3 && "Reset Password"}
                {step === 4 && "Set New Password"}
              </h1>
              <p className="text-gray-400 text-sm">
                {step === 1 && "Sign in to your Divine account"}
                {step === 2 && "Enter the OTP sent to your registered mobile"}
                {step === 3 && "Enter your email to receive a reset code"}
                {step === 4 && "Enter the code and your new password"}
              </p>
            </div>

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-md text-sm mb-6 text-center">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Password</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setStep(3);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs text-[var(--gold-primary)] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" required 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2"
                >
                  {isLoading ? "Signing in..." : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            ) : step === 2 ? (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs text-gray-400 uppercase tracking-widest text-center block">Verification Code</label>
                  <input 
                    type="text" required maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black/50 border border-[var(--surface-border)] py-4 text-center text-3xl tracking-[1em] font-bold text-[var(--gold-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 mt-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2"
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className="text-center mt-4">
                  {canResend ? (
                    <button 
                      type="button"
                      onClick={handleResendOTP}
                      className="text-xs text-[var(--gold-primary)] hover:underline uppercase tracking-widest"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Resend OTP in {resendTimer}s
                    </p>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Back to Login
                </button>
              </form>
            ) : step === 3 ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2"
                >
                  {isLoading ? "Sending..." : (
                    <>Send Reset Code <ArrowRight size={16} /></>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs text-gray-400 uppercase tracking-widest text-center block">Verification Code</label>
                  <input 
                    type="text" required maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black/50 border border-[var(--surface-border)] py-4 text-center text-3xl tracking-[1em] font-bold text-[var(--gold-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                  />
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" required 
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 mt-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Change Email
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--gold-primary)] hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

