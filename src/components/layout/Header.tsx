"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Bell } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function Header() {
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string; roleType: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tpl_admin_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse user session", err);
      }
    }
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
      <div className="min-w-0 hidden md:block">
        <h1 className="text-sm font-extrabold font-montserrat tracking-wider uppercase text-[#1A1C1C] truncate">TPL Admin Control Center</h1>
      </div>

      <div className="flex-1 max-w-md hidden lg:flex items-center gap-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 ml-auto">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search players, clubs, fixtures..."
          className="bg-transparent text-xs font-medium text-[#1A1C1C] placeholder:text-slate-400 focus:outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="relative hidden sm:block">
          <button
            onClick={() => setSeasonOpen((v) => !v)}
            className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-md pl-3 pr-2.5 py-2 text-xs font-bold font-montserrat text-[#1A1C1C] hover:border-[#FFB800] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
            2025/26 Season
            <ChevronDown size={13} className="text-slate-400" />
          </button>
          {seasonOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#E5E7EB] rounded-md shadow-lg py-1.5 z-20">
              {["2025/26 Season", "2024/25 Season", "2023/24 Season"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeasonOpen(false)}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F8F9FA] hover:text-[#1A1C1C] cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:border-[#FFB800] transition-colors cursor-pointer">
          <Bell size={16} className="text-slate-600" />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
          <Avatar name={user?.fullName ?? "Alex Whitfield"} size="sm" tone="gold" />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-bold font-montserrat text-[#1A1C1C]">
              {user?.fullName ?? "Alex Whitfield"}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {user?.roleType === "ADMIN" ? "League Admin" : (user?.roleType ?? "League Admin")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
