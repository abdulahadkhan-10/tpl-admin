import { initials } from "@/lib/utils";

export default function Avatar({
  name,
  size = "md",
  tone = "ink",
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "ink" | "muted" | "gold";
}) {
  const sizeClasses = {
    xs: "w-4 h-4 text-[7px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-11 h-11 text-xs",
    lg: "w-16 h-16 text-lg",
  }[size];

  const toneClasses = {
    ink: "bg-[#1A1C1C] text-[#FFB800] border-[#1A1C1C]",
    muted: "bg-[#F8F9FA] text-slate-600 border-[#E5E7EB]",
    gold: "bg-[#FFB800] text-[#1A1C1C] border-[#FFB800]",
  }[tone];

  return (
    <div
      className={`shrink-0 rounded-md flex items-center justify-center font-extrabold font-montserrat tracking-wider select-none border shadow-xs ${sizeClasses} ${toneClasses}`}
    >
      <span>{initials(name)}</span>
    </div>
  );
}
