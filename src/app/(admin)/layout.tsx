import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/layout/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-screen w-full flex bg-[#F9F9F9] text-[#1A1C1C] font-roboto overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1680px] w-full mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
