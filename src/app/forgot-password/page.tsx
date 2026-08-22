"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, Shield, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your administrator email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to process request. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please verify backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111315] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Editorial Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#22262a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#181B1E] rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10 relative z-10 space-y-6 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#22262B] border border-[#FFB800]/40 shadow-inner mb-1">
            <Shield size={28} className="text-[#FFB800]" />
          </div>
          <div>
            <span className="text-[10px] font-black font-montserrat uppercase tracking-widest text-[#FFB800]">
              TPL Governance
            </span>
            <h1 className="text-2xl font-black font-montserrat tracking-tight text-white uppercase mt-0.5">
              Admin Password Recovery
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {isSubmitted
              ? "Security recovery email dispatched."
              : "Enter your verified administrator credentials to receive an authenticated reset link."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <p className="text-sm font-extrabold text-emerald-300 font-montserrat uppercase">
                Recovery Link Dispatched
              </p>
              <p className="text-xs text-slate-300 font-medium">
                If <strong className="font-bold text-white">{email}</strong> is registered as an administrator, an authenticated reset link valid for 30 minutes has been sent.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full py-3 bg-[#22262B] hover:bg-[#2A2F35] border border-white/10 text-slate-300 text-xs font-bold font-montserrat uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Try Another Email
              </button>

              <Link
                href="/login"
                className="w-full py-3.5 bg-[#FFB800] hover:bg-[#E5A600] text-black text-xs font-black font-montserrat uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Admin Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="adminEmail" className="text-xs font-bold font-montserrat uppercase tracking-wider text-slate-300 block">
                Administrator Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@talentproleague.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#111315] border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFB800]/30 focus:border-[#FFB800] transition-all"
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
                  <span>Dispatching Token...</span>
                </>
              ) : (
                <span>Dispatch Recovery Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
