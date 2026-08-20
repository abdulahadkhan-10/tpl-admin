import type { LucideIcon } from "lucide-react";

const TONES = {
  ink: { bg: "bg-[#F8F9FA]", border: "border-[#E5E7EB]", icon: "text-slate-700", label: "text-slate-400" },
  gold: { bg: "bg-[#FFF9E6]", border: "border-[#FFB800]/40", icon: "text-[#7C5800]", label: "text-[#7C5800]" },
  success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-700", label: "text-emerald-600" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-700", label: "text-amber-600" },
  danger: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-700", label: "text-rose-600" },
} as const;

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "ink",
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  trend?: string;
}) {
  const t = TONES[tone];
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-md p-4 flex items-center justify-between shadow-xs">
      <div className="min-w-0">
        <span className={`text-[10px] font-bold font-montserrat uppercase tracking-widest ${t.label}`}>{label}</span>
        <span className="block text-2xl font-black font-montserrat text-[#1A1C1C] mt-0.5">{value}</span>
        {trend && <span className="block text-[10.5px] text-slate-400 font-semibold mt-0.5 truncate">{trend}</span>}
      </div>
      <div className={`w-10 h-10 rounded-md flex items-center justify-center border shrink-0 ${t.bg} ${t.border}`}>
        <Icon size={18} className={t.icon} />
      </div>
    </div>
  );
}
