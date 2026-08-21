"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  Trophy,
  CalendarClock,
  Sparkles,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { setCookie, getCookie } from "@/lib/utils";

const FEATURES = [
  { icon: Users, label: "Team & player management" },
  { icon: Trophy, label: "Scouting intelligence" },
  { icon: CalendarClock, label: "Fixtures & operations" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (getCookie("tpl_admin_token")) {
      router.push("/");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Attempt to hit the backend API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Confirm user has permission to access Admin Panel
        if (data.user.roleType !== "ADMIN") {
          toast.error("Access denied. Admin authorization required.");
          setErrorMessage("This account does not have administrator privileges.");
          setIsLoading(false);
          return;
        }

        setCookie("tpl_admin_token", data.token, 1);
        localStorage.setItem(
          "tpl_admin_user",
          JSON.stringify({
            email: data.user.email,
            fullName: data.user.fullName,
            roleType: data.user.roleType,
          })
        );

        toast.success(`Welcome back, ${data.user.fullName}!`);
        router.push("/");
      } else {
        throw new Error(data.error || "Invalid credentials");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Please check your network connection and try again."
          : err.message || "Invalid credentials."
      );
      toast.error("Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] font-roboto select-none">

      {/* ─── Left Showcase Panel (Desktop Only) ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-14 xl:p-16 relative overflow-hidden">

        {/* Mesh gradient backdrop */}
        <div className="absolute inset-0 bg-[#0B0B0C]" />
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] bg-[#FFB800]/[0.16] blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-[#3B82F6]/[0.10] blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-[#FFB800]/[0.08] blur-[130px] rounded-full pointer-events-none" />

        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 90%)",
          }}
        />

        {/* Top: Logo + Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 flex items-center justify-between"
        >
          <Image
            src="/images/TPL_logo_White.png"
            alt="Talent Pro League"
            width={136}
            height={38}
            priority
            unoptimized
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm">
            <ShieldCheck size={12} className="text-[#FFB800]" />
            <span className="text-[10.5px] font-semibold tracking-wide text-white/70">Admin Console</span>
          </div>
        </motion.div>

        {/* Center: Headline + Features */}
        <div className="z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 mb-5 text-[#FFB800]">
              <Sparkles size={13} />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Talent Pro League</span>
            </div>
            <h1 className="text-[2.6rem] leading-[1.08] font-black font-montserrat tracking-tight text-white">
              Command your
              <br />
              <span className="bg-gradient-to-r from-[#FFB800] to-[#FFD666] bg-clip-text text-transparent">
                entire league.
              </span>
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed mt-5 max-w-sm">
              One control center for teams, players, fixtures, and scouting operations across the whole competition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 space-y-1"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-3 py-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#FFB800]/30 group-hover:bg-[#FFB800]/[0.08] transition-colors">
                  <f.icon size={14} className="text-[#FFB800]" />
                </div>
                <span className="text-[13px] font-medium text-white/60">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom: Status strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="z-10 flex items-center justify-between pt-6 border-t border-white/[0.08]"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-white/35">All systems operational</span>
          </div>
          <span className="text-[11px] font-medium text-white/25">TPL-ADMIN 2.0</span>
        </motion.div>
      </div>

      {/* ─── Right Form Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-[#FCFCFC] relative">

        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-10 select-none">
          <Image
            src="/images/TPL_logo_Dark.png"
            alt="Talent Pro League"
            width={110}
            height={32}
            unoptimized
            className="h-7 w-auto object-contain"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          {/* Card */}
          <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02),0_16px_48px_-12px_rgba(0,0,0,0.08)] p-7 md:p-9">

            {/* Icon badge */}
            <div className="w-11 h-11 rounded-xl bg-[#111111] flex items-center justify-center mb-5 shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
              <KeyRound size={18} className="text-[#FFB800]" />
            </div>

            {/* Header */}
            <div className="mb-7">
              <h1 className="text-[22px] font-black font-montserrat text-[#111111] tracking-tight">
                Admin sign in
              </h1>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                Restricted access &mdash; authorized league administrators only.
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl flex gap-2 items-start text-[12.5px] font-medium leading-snug">
                    <AlertCircle size={15} className="shrink-0 mt-[1px]" />
                    <span>{errorMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[12.5px] font-semibold text-[#111111] block">
                  Email address
                </label>
                <div
                  className={`relative flex items-center rounded-xl border transition-all ${
                    focusedField === "email"
                      ? "border-[#111111] ring-4 ring-[#111111]/[0.06]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@tpl.dev"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.75 bg-transparent text-sm text-[#111111] placeholder:text-slate-400 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[12.5px] font-semibold text-[#111111] block">
                    Password
                  </label>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-[11.5px] font-semibold text-slate-400 hover:text-[#111111] cursor-pointer outline-none transition-colors"
                    onClick={() => toast("Contact support to reset your password", { icon: "🔒" })}
                  >
                    Forgot password?
                  </button>
                </div>
                <div
                  className={`relative flex items-center rounded-xl border transition-all ${
                    focusedField === "password"
                      ? "border-[#111111] ring-4 ring-[#111111]/[0.06]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.75 bg-transparent text-sm text-[#111111] placeholder:text-slate-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 text-slate-400 hover:text-[#111111] cursor-pointer outline-none flex items-center justify-center transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-3.5 h-3.5 accent-[#111111] rounded border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-[12.5px] text-slate-500 hover:text-[#111111] cursor-pointer select-none transition-colors"
                >
                  Stay signed in on this device
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 mt-2 bg-[#111111] hover:bg-black text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Signing in&hellip;</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to console</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>

            </form>
          </div>

          {/* Footer trust note */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] font-medium text-slate-400">
            <ShieldCheck size={12} />
            <span>Secured session &middot; TPL Admin v2.0</span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
