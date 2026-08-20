const TONES = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  warning: "bg-amber-50 text-amber-700 border-amber-200/60",
  danger: "bg-rose-50 text-rose-600 border-rose-200/60",
  info: "bg-sky-50 text-sky-700 border-sky-200/60",
  gold: "bg-[#FFF9E6] text-[#7C5800] border-[#FFB800]/40",
  neutral: "bg-[#F8F9FA] text-slate-600 border-[#E5E7EB]",
} as const;

const DOT_TONES = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  gold: "bg-[#FFB800]",
  neutral: "bg-slate-400",
} as const;

export default function StatusPill({
  label,
  tone = "neutral",
  dot = true,
  pulse = false,
}: {
  label: string;
  tone?: keyof typeof TONES;
  dot?: boolean;
  pulse?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-bold font-montserrat whitespace-nowrap ${TONES[tone]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_TONES[tone]} ${pulse ? "animate-pulse" : ""}`} />}
      {label}
    </span>
  );
}
