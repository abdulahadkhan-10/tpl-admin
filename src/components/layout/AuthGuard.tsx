"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { getCookie } from "@/lib/utils";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if session token exists in cookies
    const token = getCookie("tpl_admin_token");
    
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  // While checking authentication, show a premium loading screen
  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F9F9F9] font-roboto select-none">
        <div className="relative flex flex-col items-center gap-6">
          {/* Animated Spinner with Gold Theme */}
          <div className="relative w-16 h-16">
            {/* Outer spinning track */}
            <div className="absolute inset-0 rounded-full border-4 border-[#E5E7EB]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FFB800] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            {/* Inner logo icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={20} className="text-[#7C5800]" />
            </div>
          </div>
          
          {/* Text labels matching TPL brand voice */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-black font-montserrat tracking-widest text-[#1A1C1C] uppercase">
              TPL Control Center
            </span>
            <span className="text-[9px] font-bold text-[#7C5800] uppercase tracking-widest mt-1">
              Verifying Authorization...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, return loading while Next.js handles redirection
  return (
    <div className="h-screen w-full bg-[#F9F9F9] flex items-center justify-center">
      <div className="text-[10px] font-bold font-montserrat text-slate-400 uppercase tracking-wider">
        Redirecting to authorization gateway...
      </div>
    </div>
  );
}
