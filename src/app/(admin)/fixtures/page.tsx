"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, MapPin, Clock, ChevronDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { clubs, fixtures as initialFixtures, getClub, getStaff, staffDirectory } from "@/lib/mockData";
import { formatDate, formatTime } from "@/lib/utils";
import type { Fixture, FixtureStatus } from "@/lib/types";

const TABS: { id: "ALL" | FixtureStatus; label: string }[] = [
  { id: "ALL", label: "All Fixtures" },
  { id: "LIVE", label: "Live" },
  { id: "SCHEDULED", label: "Upcoming" },
  { id: "FULL_TIME", label: "Completed" },
];

function FieldSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      <div className="flex items-center justify-between bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-400 cursor-pointer hover:border-[#FFB800] transition-colors">
        {placeholder}
        <ChevronDown size={14} />
      </div>
    </div>
  );
}

export default function FixturesPage() {
  const [tab, setTab] = useState<"ALL" | FixtureStatus>("ALL");
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);

  const visible = useMemo(() => (tab === "ALL" ? fixtures : fixtures.filter((f) => f.status === tab)), [fixtures, tab]);
  const liveCount = fixtures.filter((f) => f.status === "LIVE").length;

  function adjustScore(id: string, side: "home" | "away", delta: number) {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const key = side === "home" ? "homeScore" : "awayScore";
        const next = Math.max(0, (f[key] ?? 0) + delta);
        return { ...f, [key]: next };
      })
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Matchday Operations" title="Fixtures & Matches" subtitle="Matchday 14 · Premier Division" />

      <div className="flex gap-1.5 bg-white border border-[#E5E7EB] rounded-md p-1.5 w-fit shadow-xs">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer ${
              tab === t.id ? "bg-[#1A1C1C] text-[#FFB800]" : "text-slate-500 hover:bg-[#F8F9FA]"
            }`}
          >
            {t.label} {t.id === "LIVE" && liveCount > 0 ? `(${liveCount})` : ""}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs divide-y divide-[#E5E7EB]">
          {visible.map((fx) => {
            const home = getClub(fx.homeClubId)!;
            const away = getClub(fx.awayClubId)!;
            const referee = getStaff(fx.refereeId);
            return (
              <div key={fx.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                <div className="w-16 shrink-0 text-center">
                  <p className="text-sm font-black font-montserrat text-[#1A1C1C]">
                    {fx.status === "LIVE" ? "Live" : fx.status === "FULL_TIME" ? "FT" : new Date(fx.kickoff).toLocaleDateString("en-GB", { weekday: "short" })}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">{fx.status === "SCHEDULED" ? formatTime(fx.kickoff) : formatDate(fx.kickoff)}</p>
                </div>

                <div className="flex items-center justify-center gap-4 flex-1">
                  <div className="flex items-center gap-2.5 flex-1 justify-end">
                    <span className="text-xs font-bold font-montserrat text-[#1A1C1C] text-right">{home.name}</span>
                    <Avatar name={home.name} size="sm" />
                  </div>

                  <div className="flex flex-col items-center gap-1.5 w-24 shrink-0">
                    {fx.status === "SCHEDULED" ? (
                      <span className="text-sm font-black font-montserrat text-slate-300">VS</span>
                    ) : (
                      <span className="text-lg font-black font-montserrat text-[#1A1C1C]">
                        {fx.homeScore} – {fx.awayScore}
                      </span>
                    )}
                    {fx.status === "LIVE" && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustScore(fx.id, "home", -1)} className="w-5 h-5 rounded bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800]">
                            <Minus size={10} />
                          </button>
                          <button onClick={() => adjustScore(fx.id, "home", 1)} className="w-5 h-5 rounded bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800]">
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustScore(fx.id, "away", -1)} className="w-5 h-5 rounded bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800]">
                            <Minus size={10} />
                          </button>
                          <button onClick={() => adjustScore(fx.id, "away", 1)} className="w-5 h-5 rounded bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800]">
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-1">
                    <Avatar name={away.name} size="sm" tone="muted" />
                    <span className="text-xs font-bold font-montserrat text-[#1A1C1C]">{away.name}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full md:w-44 shrink-0 text-[10.5px] font-semibold text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} /> {fx.venue} · {fx.pitch}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} /> {referee ? `Ref: ${referee.fullName}` : "Referee TBC"}
                  </span>
                </div>

                <div className="shrink-0">
                  {fx.status === "LIVE" && <StatusPill label={`LIVE ${fx.minute}'`} tone="danger" pulse />}
                  {fx.status === "SCHEDULED" && <StatusPill label="Scheduled" tone="info" dot={false} />}
                  {fx.status === "FULL_TIME" && <StatusPill label="Full Time" tone="neutral" dot={false} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Schedule New Match</h3>
          <div className="grid grid-cols-2 gap-3">
            <FieldSelect label="Home Club" placeholder="Select club" />
            <FieldSelect label="Away Club" placeholder="Select club" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldSelect label="Date" placeholder="Pick a date" />
            <FieldSelect label="Kick-off" placeholder="Pick a time" />
          </div>
          <FieldSelect label="Venue / Pitch" placeholder="Select venue" />
          <FieldSelect label="Assign Referee" placeholder={staffDirectory.find((s) => s.role === "REFEREE")?.fullName ?? "Select referee"} />
          <FieldSelect label="Assign Commissioner" placeholder={staffDirectory.find((s) => s.role === "COMMISSIONER")?.fullName ?? "Select commissioner"} />
          <button className="w-full py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer">
            Schedule Fixture
          </button>
          <p className="text-[10px] text-slate-400 font-semibold text-center">{clubs.length} clubs available in Season 2025/26</p>
        </div>
      </div>
    </div>
  );
}
