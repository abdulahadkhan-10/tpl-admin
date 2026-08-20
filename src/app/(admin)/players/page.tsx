"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { players } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

function ageFromDob(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(players[0].id);
  const [mvpOverride, setMvpOverride] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () => players.filter((p) => p.fullName.toLowerCase().includes(query.toLowerCase()) || p.position.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const selected = players.find((p) => p.id === selectedId) ?? players[0];
  const isMvp = mvpOverride[selected.id] ?? selected.isMvpFeatured;

  const radarData = [
    { attribute: "Pace", value: selected.attributes.pace },
    { attribute: "Shooting", value: selected.attributes.shooting },
    { attribute: "Passing", value: selected.attributes.passing },
    { attribute: "Dribbling", value: selected.attributes.dribbling },
    { attribute: "Defending", value: selected.attributes.defending },
    { attribute: "Physical", value: selected.attributes.physical },
  ];

  const attributeRows: [string, number][] = [
    ["Pace", selected.attributes.pace],
    ["Shooting", selected.attributes.shooting],
    ["Passing", selected.attributes.passing],
    ["Dribbling", selected.attributes.dribbling],
    ["Defending", selected.attributes.defending],
    ["Physical", selected.attributes.physical],
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Scouting Network" title="Players & Scouting" subtitle={`${players.length} tracked prospects across all clubs`} />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <div className="space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roster..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-md text-xs font-medium focus:outline-none focus:border-[#FFB800]"
            />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-2 space-y-1 max-h-[640px] overflow-y-auto custom-scrollbar">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors cursor-pointer ${
                  selectedId === p.id ? "bg-[#FFF9E6] border border-[#FFB800]/50" : "hover:bg-[#F8F9FA] border border-transparent"
                }`}
              >
                <Avatar name={p.fullName} size="sm" tone={selectedId === p.id ? "gold" : "ink"} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{p.fullName}</p>
                  <p className="text-[10.5px] text-slate-400 font-semibold truncate">
                    {p.position} · {p.teamName}
                  </p>
                </div>
                <span className="text-xs font-black font-montserrat text-[#7C5800]">{p.scoutGrade}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={selected.fullName} size="lg" tone="ink" />
              <div>
                <h2 className="text-lg md:text-xl font-black font-montserrat uppercase text-[#1A1C1C]">{selected.fullName}</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {selected.position} · {selected.teamName} · Age {ageFromDob(selected.dateOfBirth)} · {selected.nationality}{" "}
                  <span className="ml-1 px-1.5 py-0.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-[10px] font-black text-[#1A1C1C]">#{selected.jerseyNumber}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setMvpOverride((prev) => ({ ...prev, [selected.id]: !isMvp }))}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-colors cursor-pointer shrink-0 ${
                isMvp ? "bg-[#FFF9E6] border-[#FFB800]/60" : "bg-[#F8F9FA] border-[#E5E7EB]"
              }`}
            >
              <span className={`relative w-9 h-5 rounded-full transition-colors ${isMvp ? "bg-[#FFB800]" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${isMvp ? "left-[18px]" : "left-0.5"}`} />
              </span>
              <span className="text-left">
                <span className="flex items-center gap-1 text-xs font-extrabold font-montserrat text-[#1A1C1C]">
                  <Sparkles size={13} className={isMvp ? "text-[#FFB800]" : "text-slate-400"} /> MVP Spotlight
                </span>
                <span className="block text-[10px] font-semibold text-slate-400">Featured on public site</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
              <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C] mb-2">Scout Radar</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fill: "#64748B", fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
                    <Radar dataKey="value" stroke="#FFB800" fill="#FFB800" fillOpacity={0.35} strokeWidth={2} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
              <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C] mb-4">Attribute Breakdown</h3>
              <div className="space-y-3.5">
                {attributeRows.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-bold font-montserrat text-slate-600">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#7C5800]" style={{ width: `${value}%` }} />
                    </div>
                    <span className="w-7 text-right text-xs font-black font-montserrat text-[#1A1C1C]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
              <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C] mb-3">Kit &amp; Equipment</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  ["Jersey Size", selected.shirtSize ?? "—"],
                  ["Shorts Size", selected.shortsSize ?? "—"],
                  ["Sock Size", selected.sockSize ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] last:border-b-0">
                    <span className="text-slate-400 font-semibold">{label}</span>
                    <span className="font-bold text-[#1A1C1C]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
              <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C] mb-3">Medical Flags</h3>
              <div className="space-y-2">
                {selected.medicalFlags.map((flag) => (
                  <div
                    key={flag.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-[11.5px] font-bold font-montserrat ${
                      flag.severity === "OK" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {flag.severity === "OK" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    {flag.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
              <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C] mb-3">Scout Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{selected.scoutNote}</p>
              {selected.scoutedBy && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E5E7EB]">
                  <Avatar name={selected.scoutedBy} size="sm" tone="muted" />
                  <div>
                    <p className="text-[11px] font-bold text-[#1A1C1C]">{selected.scoutedBy}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selected.scoutedAt && `Filed ${formatDate(selected.scoutedAt)}`}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
