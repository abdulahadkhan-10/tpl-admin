"use client";

import { useMemo, useState } from "react";
import { Plus, Search, ChevronRight, Phone, Mail } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { clubs } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { RegistrationFeeStatus } from "@/lib/types";

const FEE_TONE: Record<RegistrationFeeStatus, "success" | "warning" | "danger"> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "danger",
};

export default function TeamsPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(clubs[0].id);

  const filtered = useMemo(
    () => clubs.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.region.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const selected = clubs.find((c) => c.id === selectedId) ?? clubs[0];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Club Directory"
        title="Teams & Clubs"
        subtitle={`${clubs.length} clubs · Season 2025/26`}
        action={
          <button className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-white text-xs font-bold font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1A1C1C]">
            <Plus size={16} className="text-[#FFB800]" />
            <span>Add Club</span>
          </button>
        }
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md border border-[#E5E7EB] shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search clubs by name or region..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-medium focus:outline-none focus:border-[#FFB800] focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 text-[10.5px] font-bold font-montserrat text-slate-400 uppercase tracking-wide">
          {clubs.filter((c) => c.registrationFeeStatus === "OVERDUE").length} clubs need fee follow-up
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Club", "Head Coach", "Players", "Reg. Fee", "Match Staff", "Status", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((club) => (
                <tr
                  key={club.id}
                  onClick={() => setSelectedId(club.id)}
                  className={`border-b border-[#E5E7EB] last:border-b-0 cursor-pointer transition-colors ${
                    selectedId === club.id ? "bg-[#FFF9E6]" : "hover:bg-[#F8F9FA]"
                  }`}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={club.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-montserrat text-[#1A1C1C] whitespace-nowrap">{club.name}</p>
                        <p className="text-[10.5px] text-slate-400 font-semibold whitespace-nowrap">{club.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-semibold text-[#1A1C1C] whitespace-nowrap">{club.manager.fullName}</span>
                  </td>
                  <td className="px-3 py-3 text-xs font-bold text-[#1A1C1C]">{club.playerCount}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={club.registrationFeeStatus.charAt(0) + club.registrationFeeStatus.slice(1).toLowerCase()} tone={FEE_TONE[club.registrationFeeStatus]} />
                  </td>
                  <td className="px-3 py-3">
                    {club.assignedStaff.length ? (
                      <div className="flex flex-col gap-1 items-start">
                        {club.assignedStaff.map((s) => (
                          <span key={s.id} className="inline-flex items-center gap-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full pl-1 pr-2.5 py-1 text-[10px] font-bold text-slate-600 whitespace-nowrap">
                            <Avatar name={s.fullName} size="xs" tone="muted" />
                            {s.role === "REFEREE" ? "Ref" : "Comm."}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill label={club.verified ? "Verified" : "In Review"} tone={club.verified ? "info" : "neutral"} />
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight size={16} className="text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 space-y-5">
          <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-[#E5E7EB]">
            <Avatar name={selected.name} size="lg" />
            <div>
              <p className="text-base font-black font-montserrat uppercase text-[#1A1C1C]">{selected.name}</p>
              <p className="text-[11px] text-slate-400 font-semibold">
                {selected.region} · Founded {selected.founded}
              </p>
            </div>
            <StatusPill label={selected.verified ? "Verified Club" : "In Review"} tone={selected.verified ? "info" : "neutral"} />
            <div className="flex w-full justify-between pt-2">
              <div className="flex flex-col items-center">
                <span className="text-base font-black font-montserrat text-[#1A1C1C]">{selected.playerCount}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Players</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-black font-montserrat text-[#1A1C1C]">{selected.avgAge}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Avg Age</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base font-black font-montserrat text-[#1A1C1C]">{selected.ageGroup}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Division</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-2">Head Coach</p>
            <div className="flex items-center gap-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3">
              <Avatar name={selected.manager.fullName} size="md" tone="muted" />
              <div className="min-w-0">
                <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{selected.manager.fullName}</p>
                <p className="text-[10.5px] text-slate-400 font-semibold truncate flex items-center gap-1">
                  <Phone size={10} /> {selected.manager.contactNumber}
                </p>
                {selected.manager.email && (
                  <p className="text-[10.5px] text-slate-400 font-semibold truncate flex items-center gap-1">
                    <Mail size={10} /> {selected.manager.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-2">Registration Fee</p>
            <div className="flex items-center justify-between bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3">
              <div>
                <p className="text-sm font-black font-montserrat text-[#1A1C1C]">£{selected.registrationFeeAmount.toFixed(2)}</p>
                <p className="text-[10.5px] text-slate-400 font-semibold">
                  {selected.registrationFeeDate ? `Paid on ${formatDate(selected.registrationFeeDate)}` : "Not yet paid"}
                </p>
              </div>
              <StatusPill label={selected.registrationFeeStatus.charAt(0) + selected.registrationFeeStatus.slice(1).toLowerCase()} tone={FEE_TONE[selected.registrationFeeStatus]} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-2">Match Staff Assigned</p>
            <div className="space-y-2">
              {selected.assignedStaff.length === 0 && <p className="text-xs text-slate-400 font-semibold">No staff assigned yet.</p>}
              {selected.assignedStaff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-2.5">
                  <Avatar name={s.fullName} size="sm" tone="muted" />
                  <div>
                    <p className="text-xs font-bold font-montserrat text-[#1A1C1C]">{s.fullName}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{s.role === "REFEREE" ? "Referee" : "Commissioner"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
