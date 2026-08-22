"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, KeyRound, Loader2, ArrowLeft, Shield } from "lucide-react";

function AdminResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Missing or invalid password reset token. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Master password must be at least 6 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
      } else {
        setErrorMsg(data.error || "Failed to reset password. The link may have expired.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please verify backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="w-full max-w-md bg-[#181B1E] rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-2xl font-black font-montserrat uppercase text-white">
          Invalid Token
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          This security recovery token is invalid or has expired. Please request a new administrator recovery link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full py-3.5 bg-[#FFB800] hover:bg-[#E5A600] text-black text-xs font-black font-montserrat uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          Request New Recovery Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#181B1E] rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10 relative z-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#22262B] border border-[#FFB800]/40 shadow-inner mb-1">
          <KeyRound size={28} className="text-[#FFB800]" />
        </div>
        <div>
          <span className="text-[10px] font-black font-montserrat uppercase tracking-widest text-[#FFB800]">
            Master Credentials
          </span>
          <h1 className="text-2xl font-black font-montserrat tracking-tight text-white uppercase mt-0.5">
            Set New Password
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          {isSuccess
            ? "Your administrator credentials have been updated."
            : "Define a secure new master password for your administrator account."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <p className="text-sm font-extrabold text-emerald-300 font-montserrat uppercase">
              Password Reset Complete
            </p>
            <p className="text-xs text-slate-300 font-medium">
              Your master credentials have been updated securely. You can now access the Admin Control Center.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 bg-[#FFB800] hover:bg-[#E5A600] text-black text-xs font-black font-montserrat uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Proceed to Admin Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="adminPass" className="text-xs font-bold font-montserrat uppercase tracking-wider text-slate-300 block">
              New Master Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                id="adminPass"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#111315] border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB800]/30 focus:border-[#FFB800] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmAdminPass" className="text-xs font-bold font-montserrat uppercase tracking-wider text-slate-300 block">
              Confirm New Master Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                id="confirmAdminPass"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#111315] border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB800]/30 focus:border-[#FFB800] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#FFB800] hover:bg-[#E5A600] text-black text-xs font-black font-montserrat uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-black" />
                <span>Updating Master Key...</span>
              </>
            ) : (
              <span>Confirm & Reset Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#111315] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#22262a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <Suspense fallback={<div className="text-[#FFB800] text-xs font-bold font-montserrat uppercase">Authenticating security token...</div>}>
        <AdminResetPasswordForm />
      </Suspense>
    </div>
  );
}
