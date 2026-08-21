"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { eraseCookie } from "@/lib/utils";
import {
  LayoutDashboard,
  Shield,
  Users,
  CalendarDays,
  Trophy,
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
} from "lucide-react";
import { supportTickets } from "@/lib/mockData";

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function handleLogout() {
    eraseCookie("tpl_admin_token");
    localStorage.removeItem("tpl_admin_user");
    toast.success("Successfully logged out");
    router.push("/login");
  }

  const openTicketCount = supportTickets.filter((t) => t.status !== "RESOLVED").length;

  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Teams & Clubs", path: "/teams", icon: Shield },
    { name: "Players & Scouting", path: "/players", icon: Users },
    { name: "Fixtures & Matches", path: "/fixtures", icon: CalendarDays },
    { name: "Standings", path: "/standings", icon: Trophy },
    { name: "Support Desk", path: "/support", icon: LifeBuoy, badge: openTicketCount },
  ];

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <>
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-[#1A1C1C] text-white rounded-xl shadow-lg border border-[#FFB800]/40 flex items-center justify-center cursor-pointer hover:bg-black transition-all"
        >
          {mobileOpen ? <X size={20} className="text-[#FFB800]" /> : <Menu size={20} className="text-[#FFB800]" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isCollapsed ? 82 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-[#E5E7EB] z-40 flex flex-col justify-between overflow-hidden select-none shadow-xs shrink-0 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="p-4 pb-3.5 border-b border-[#E5E7EB] shrink-0 flex items-center justify-between min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group overflow-hidden min-w-0">
              <Image
                src="/images/TPL_logo_Dark.png"
                alt="Talent Pro League"
                width={120}
                height={36}
                unoptimized
                priority
                className="h-8 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
              />
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-w-0">
                  <span className="text-[11px] font-extrabold font-montserrat tracking-tight text-[#1A1C1C] uppercase leading-tight whitespace-nowrap">TPL Admin</span>
                  <span className="text-[9px] text-[#7C5800] font-bold uppercase tracking-widest leading-tight whitespace-nowrap">Control Center</span>
                </motion.div>
              )}
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-[#F8F9FA] transition-colors cursor-pointer shrink-0 hidden lg:flex items-center justify-center"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <PanelLeftClose size={18} />
              </motion.div>
            </button>
          </div>

          <div className="py-4 px-3 space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <motion.div key={item.path} whileHover={{ x: isCollapsed ? 0 : 3 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? item.name : undefined}
                    className={`relative flex items-center ${isCollapsed ? "justify-center px-0 py-3.5" : "justify-between px-3.5 py-3.5"} rounded-xl text-sm transition-all duration-200 cursor-pointer border ${
                      active
                        ? "bg-[#FFF9E6] text-[#1A1C1C] border-[#FFB800]/50 shadow-xs font-bold"
                        : "bg-white text-slate-700 hover:bg-[#F8F9FA] hover:text-black border-transparent hover:border-[#E5E7EB]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="adminActiveBar"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#FFB800] rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div className={`flex items-center gap-3.5 min-w-0 ${isCollapsed ? "justify-center" : ""}`}>
                      <Icon size={19} className={active ? "text-[#7C5800]" : "text-slate-500"} strokeWidth={1.9} />
                      {!isCollapsed && (
                        <span className={`font-montserrat truncate text-[13.5px] ${active ? "font-extrabold text-[#1A1C1C]" : "font-medium"}`}>{item.name}</span>
                      )}
                    </div>
                    {!isCollapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-montserrat shrink-0 ${active ? "bg-[#FFB800] text-black shadow-xs" : "bg-[#F3F4F6] text-slate-600 border border-[#E5E7EB]"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="p-3 border-t border-[#E5E7EB] space-y-1.5 shrink-0 bg-[#F8F9FA]">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "gap-3.5 px-3.5 py-3"} rounded-xl text-sm cursor-pointer transition-all ${
              isActive("/settings") ? "text-[#1A1C1C] font-bold bg-white border border-[#E5E7EB]" : "text-slate-600 hover:bg-white"
            }`}
          >
            <Settings size={18} strokeWidth={1.9} />
            {!isCollapsed && <span className="font-montserrat text-[13.5px] font-medium">Settings</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log Out" : undefined}
            className={`w-full flex items-center ${isCollapsed ? "justify-center py-3 px-0" : "justify-between px-3.5 py-3"} rounded-xl text-xs font-black text-rose-600 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/60 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-2.5">
              <LogOut size={18} strokeWidth={1.9} />
              {!isCollapsed && <span className="font-montserrat uppercase tracking-wider text-xs">Log Out</span>}
            </div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
