"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { standings, getClub } from "@/lib/mockData";

const DIVISIONS = ["Premier Division", "Championship", "U18 League"];

const FORM_STYLE: Record<"W" | "D" | "L", string> = {
  W: "bg-emerald-500",
  D: "bg-slate-300",
  L: "bg-rose-500",
};

export default function StandingsPage() {
  const [division, setDivision] = useState(DIVISIONS[0]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader eyebrow="Automated Table" title="League Standings" subtitle="Updates automatically after every full-time result" />

      <div className="flex gap-1.5 bg-white border border-[#E5E7EB] rounded-md p-1.5 w-fit shadow-xs">
        {DIVISIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDivision(d)}
            className={`px-4 py-2 rounded-md text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer ${
              division === d ? "bg-[#1A1C1C] text-[#FFB800]" : "text-slate-500 hover:bg-[#F8F9FA]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {division !== "Premier Division" ? (
        <div className="bg-white border border-[#E5E7EB] rounded-md p-12 text-center shadow-xs">
          <p className="text-xs font-bold font-montserrat uppercase text-slate-400">No standings published yet for {division}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[860px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Pos</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Club</th>
                  {["P", "W", "D", "L", "GF", "GA", "GD", "Pen"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">
                      {h}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">Pts</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => {
                  const club = getClub(row.clubId)!;
                  const gd = row.goalsFor - row.goalsAgainst;
                  return (
                    <tr
                      key={row.position}
                      className={`border-b border-[#E5E7EB] last:border-b-0 ${
                        row.zone === "PROMOTION" ? "bg-emerald-50/60" : row.zone === "RELEGATION" ? "bg-rose-50/60" : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-1 h-5 rounded-full ${row.zone === "PROMOTION" ? "bg-emerald-500" : row.zone === "RELEGATION" ? "bg-rose-500" : "bg-transparent"}`} />
                          <span className="text-xs font-black font-montserrat text-slate-500">{row.position}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={club.name} size="sm" />
                          <span className="text-xs font-bold font-montserrat text-[#1A1C1C] whitespace-nowrap">{club.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.played}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.won}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.drawn}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.lost}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.goalsFor}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">{row.goalsAgainst}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-600">
                        {gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold">
                        {row.pointsPenalty > 0 ? <span className="text-rose-600">-{row.pointsPenalty}</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center text-sm font-black font-montserrat text-[#1A1C1C]">{row.points}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {row.form.map((r, i) => (
                            <span key={i} className={`w-2 h-2 rounded-full ${FORM_STYLE[r]}`} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 mt-2 border-t border-[#E5E7EB]">
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Promotion / Championship Playoff
            </span>
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Relegation Zone
            </span>
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-300" /> Points Penalty Applied
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
