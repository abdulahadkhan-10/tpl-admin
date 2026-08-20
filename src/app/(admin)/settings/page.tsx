import { Settings as SettingsIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Admin Preferences" title="Settings" subtitle="Account, notification and league configuration" />
      <div className="bg-white border border-[#E5E7EB] rounded-md p-16 text-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4">
          <SettingsIcon size={20} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Settings coming soon</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Admin roles, notification preferences and season configuration will live here.</p>
      </div>
    </div>
  );
}
