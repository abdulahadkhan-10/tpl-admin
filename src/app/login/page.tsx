"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { setCookie, getCookie } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

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
        if (data.user?.roleType !== "ADMIN") {
          toast.error("Access denied. Admin authorization required.");
          setErrorMessage("This account does not have administrator privileges.");
          setIsLoading(false);
          return;
        }

        setCookie("tpl_admin_token", data.token, rememberMe ? 7 : 1);
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
          ? "Cannot connect to server. Please check backend connection."
          : err.message || "Invalid credentials."
      );
      toast.error("Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0B0E] text-white flex flex-col lg:grid lg:grid-cols-2 font-roboto selection:bg-[#FFB800] selection:text-black">
      
      {/* ─── Left Visual Showcase ───────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Background Image with Cinematic Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tpl-slide1-matchday.png"
            alt="Talent Pro League Matchday"
            fill
            priority
            className="object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/60 to-[#0A0B0E]/80" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0A0B0E]/40 to-[#0A0B0E]" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <Image
            src="/images/TPL_logo_White.png"
            alt="Talent Pro League"
            width={150}
            height={44}
            priority
            unoptimized
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Editorial Text */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="w-12 h-1 bg-[#FFB800] rounded-full" />
          <h1 className="text-3xl xl:text-4xl font-extrabold font-montserrat text-white tracking-tight leading-tight">
            The Official League Management Platform
          </h1>
          <p className="text-sm xl:text-base text-zinc-300 leading-relaxed">
            Centralized administration for competition fixtures, franchise operations, athlete records, and scouting intelligence.
          </p>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} Talent Pro League. All rights reserved.
        </div>
      </div>

      {/* ─── Right Form Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-[#0A0B0E] relative z-10">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-10">
          <Image
            src="/images/TPL_logo_White.png"
            alt="Talent Pro League"
            width={140}
            height={40}
            unoptimized
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-montserrat text-white tracking-tight">
              Admin Sign In
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Enter your authorized credentials to access the console.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block font-montserrat"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talentproleague.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block font-montserrat"
                >
                  Password
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-xs text-zinc-400 hover:text-[#FFB800] transition-colors"
                  onClick={() => toast("Please contact your system administrator to reset credentials.")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-[#FFB800] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-zinc-400 hover:text-zinc-300 cursor-pointer select-none"
              >
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#FFB800] hover:bg-[#f0ad00] active:scale-[0.99] text-black font-extrabold font-montserrat text-sm tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center text-xs text-zinc-400">
            Authorized personnel only. All access attempts are logged.
          </div>
        </div>
      </div>
    </div>
  );
}
