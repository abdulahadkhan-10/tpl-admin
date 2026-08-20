import React from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-md border border-[#E5E7EB] shadow-xs">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#FFB800] text-black text-[10px] font-black font-montserrat uppercase tracking-widest rounded-xs">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-black font-montserrat tracking-tight text-[#1A1C1C] uppercase">{title}</h1>
        {subtitle && <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
