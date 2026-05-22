"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, ArrowRight } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Execute reCAPTCHA Enterprise
      let captchaToken;
      try {
        captchaToken = await executeRecaptchaEnterprise("register");
      } catch (err) {
        throw new Error("Security check failed to load. Please refresh and try again.");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-signup`, {
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      router.push("/menu");
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

      <div className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="bg-[var(--surface-dark)] p-8 md:p-10 border border-[var(--surface-border)] rounded-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-light)] to-[var(--gold-dark)]" />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif text-white mb-2">
                {step === 1 ? "Join The Divine" : "Verify Your Mobile"}
              </h1>
              <p className="text-gray-400 text-sm">
                {step === 1 
                  ? "Create an account for exclusive dining experiences" 
                  : `Enter the 6-digit code sent to ${formData.phone}`}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" required 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="tel" required 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                      />
                    </div>
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Password</label>
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

                  <div className="space-y-2 relative">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" required 
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full bg-black/50 border border-[var(--surface-border)] py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--gold-primary)] transition-colors rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 mt-4 bg-[var(--gold-primary)] text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 rounded-md flex items-center justify-center gap-2"
                >
                  {isLoading ? "Sending OTP..." : (
                    <>Next <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            ) : (
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
                  {isLoading ? "Verifying..." : "Verify & Sign Up"}
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
                  Change Details
                </button>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--gold-primary)] hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

