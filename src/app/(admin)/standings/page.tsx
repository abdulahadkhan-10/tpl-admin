"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Trophy,
  Download,
  RefreshCw,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { standings as initialPremierStandings, getClub, clubs } from "@/lib/mockData";
import type { StandingRow } from "@/lib/types";

const DIVISIONS = ["Premier Division", "Championship", "U18 Academy League"] as const;
type DivisionType = (typeof DIVISIONS)[number];

// Mock initial data for Championship
const initialChampionshipStandings: StandingRow[] = [
  { position: 1, clubId: "club-2", played: 14, won: 10, drawn: 1, lost: 3, goalsFor: 30, goalsAgainst: 14, pointsPenalty: 0, points: 31, form: ["W", "W", "W", "W", "L"], zone: "PROMOTION" },
  { position: 2, clubId: "club-4", played: 14, won: 9, drawn: 2, lost: 3, goalsFor: 26, goalsAgainst: 16, pointsPenalty: 0, points: 29, form: ["W", "D", "W", "W", "W"], zone: "PROMOTION" },
  { position: 3, clubId: "club-6", played: 14, won: 7, drawn: 3, lost: 4, goalsFor: 22, goalsAgainst: 18, pointsPenalty: 0, points: 24, form: ["D", "W", "L", "W", "D"], zone: null },
  { position: 4, clubId: "club-1", played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 20, goalsAgainst: 20, pointsPenalty: 0, points: 21, form: ["L", "W", "D", "L", "W"], zone: null },
  { position: 5, clubId: "club-3", played: 14, won: 4, drawn: 3, lost: 7, goalsFor: 16, goalsAgainst: 24, pointsPenalty: 0, points: 15, form: ["W", "L", "L", "D", "L"], zone: null },
  { position: 6, clubId: "club-5", played: 14, won: 2, drawn: 2, lost: 10, goalsFor: 12, goalsAgainst: 34, pointsPenalty: 0, points: 8, form: ["L", "L", "L", "L", "D"], zone: "RELEGATION" },
];

// Mock initial data for U18 Academy League
const initialU18Standings: StandingRow[] = [
  { position: 1, clubId: "club-3", played: 12, won: 9, drawn: 2, lost: 1, goalsFor: 35, goalsAgainst: 11, pointsPenalty: 0, points: 29, form: ["W", "W", "W", "D", "W"], zone: "PROMOTION" },
  { position: 2, clubId: "club-1", played: 12, won: 8, drawn: 2, lost: 2, goalsFor: 29, goalsAgainst: 15, pointsPenalty: 0, points: 26, form: ["W", "W", "L", "W", "W"], zone: "PROMOTION" },
  { position: 3, clubId: "club-5", played: 12, won: 7, drawn: 1, lost: 4, goalsFor: 24, goalsAgainst: 19, pointsPenalty: 0, points: 22, form: ["W", "L", "W", "W", "D"], zone: null },
  { position: 4, clubId: "club-2", played: 12, won: 5, drawn: 2, lost: 5, goalsFor: 21, goalsAgainst: 22, pointsPenalty: 0, points: 17, form: ["D", "W", "L", "D", "L"], zone: null },
  { position: 5, clubId: "club-6", played: 12, won: 3, drawn: 1, lost: 8, goalsFor: 14, goalsAgainst: 28, pointsPenalty: 0, points: 10, form: ["L", "L", "W", "L", "L"], zone: null },
  { position: 6, clubId: "club-4", played: 12, won: 1, drawn: 2, lost: 9, goalsFor: 9, goalsAgainst: 37, pointsPenalty: 0, points: 5, form: ["L", "L", "L", "D", "L"], zone: "RELEGATION" },
];

const FORM_STYLE: Record<"W" | "D" | "L", string> = {
  W: "bg-emerald-500",
  D: "bg-slate-300",
  L: "bg-rose-500",
};

export default function StandingsPage() {
  const [division, setDivision] = useState<DivisionType>("Premier Division");
  const [isLoading, setIsLoading] = useState(false);

  // Division Tables State
  const [divisionData, setDivisionData] = useState<Record<DivisionType, StandingRow[]>>({
    "Premier Division": initialPremierStandings,
    "Championship": initialChampionshipStandings,
    "U18 Academy League": initialU18Standings,
  });

  // Fetch dynamic standings from backend API
  const fetchStandings = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/fixtures/standings`);
      if (res.ok) {
        const data = await res.json();
        if (data.standings && Array.isArray(data.standings) && data.standings.length > 0) {
          setDivisionData((prev) => ({
            ...prev,
            "Premier Division": data.standings,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load standings from backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  // Points Penalty Modal State
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [penaltyClubId, setPenaltyClubId] = useState(initialPremierStandings[0]?.clubId ?? "club-1");
  const [penaltyPoints, setPenaltyPoints] = useState("3");
  const [penaltyReason, setPenaltyReason] = useState("Fielding Ineligible Player");

  // Current active table sorted with re-computed positions
  const currentTable = useMemo(() => {
    const raw = divisionData[division] ?? [];
    // Sort by Points desc, Goal Difference desc, Goals For desc
    const sorted = [...raw].sort((a, b) => {
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (b.points !== a.points) return b.points - a.points;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });

    // Re-assign 1-indexed position and top 2 promotion, bottom 1 relegation zones
    return sorted.map((row, index) => {
      let zone: "PROMOTION" | "RELEGATION" | null = null;
      if (index < 2) zone = "PROMOTION";
      else if (index === sorted.length - 1) zone = "RELEGATION";
      return {
        ...row,
        position: index + 1,
        zone,
      };
    });
  }, [divisionData, division]);

  // Actions
  function handleApplyPenalty(e: React.FormEvent) {
    e.preventDefault();
    const pts = Number(penaltyPoints) || 0;
    if (pts < 0) {
      toast.error("Penalty points must be a positive number.");
      return;
    }

    const clubName = getClub(penaltyClubId)?.name ?? "Club";

    setDivisionData((prev) => {
      const currentRows = prev[division];
      const updated = currentRows.map((r) => {
        if (r.clubId !== penaltyClubId) return r;
        const newPoints = Math.max(0, r.won * 3 + r.drawn - pts);
        return {
          ...r,
          pointsPenalty: pts,
          points: newPoints,
        };
      });
      return { ...prev, [division]: updated };
    });

    setIsPenaltyModalOpen(false);
    toast.success(pts > 0 ? `${pts} pts deduction applied to ${clubName}!` : `Penalty cleared for ${clubName}.`);
  }

  function handleRevokePenalty(clubId: string) {
    const clubName = getClub(clubId)?.name ?? "Club";
    setDivisionData((prev) => {
      const currentRows = prev[division];
      const updated = currentRows.map((r) => {
        if (r.clubId !== clubId) return r;
        const newPoints = r.won * 3 + r.drawn;
        return {
          ...r,
          pointsPenalty: 0,
          points: newPoints,
        };
      });
      return { ...prev, [division]: updated };
    });
    toast.success(`Penalty revoked for ${clubName}. Points restored.`);
  }

  async function handleSyncFixtures() {
    await fetchStandings();
    toast.success(`Standings table synchronized with latest match results!`);
  }

  function handleExportCSV() {
    const headers = "Position,Club,Played,Won,Drawn,Lost,GF,GA,GD,Points Penalty,Points\n";
    const rows = currentTable
      .map((r) => {
        const clubName = getClub(r.clubId)?.name ?? "Unknown";
        const gd = r.goalsFor - r.goalsAgainst;
        return `${r.position},"${clubName}",${r.played},${r.won},${r.drawn},${r.lost},${r.goalsFor},${r.goalsAgainst},${gd},${r.pointsPenalty},${r.points}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TPL_${division.replace(/\s+/g, "_")}_Standings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Standings exported to CSV!");
  }

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader
        eyebrow="Automated League Table"
        title="League Standings"
        subtitle={`Matchday 14 · ${division} · Auto-computed from match events`}
      />

      {/* Control Bar: Division Switcher & Action Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-md border border-[#E5E7EB] shadow-xs">
        {/* Division Tabs */}
        <div className="flex gap-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-1 overflow-x-auto custom-scrollbar">
          {DIVISIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDivision(d)}
              className={`px-3.5 py-1.5 rounded text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer whitespace-nowrap ${
                division === d ? "bg-[#1A1C1C] text-[#FFB800] shadow-xs" : "text-slate-500 hover:text-black hover:bg-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Disciplinary Points Deduction Trigger */}
          <button
            onClick={() => setIsPenaltyModalOpen(true)}
            className="px-3 py-1.5 bg-[#F8F9FA] hover:bg-rose-50 border border-[#E5E7EB] hover:border-rose-300 text-rose-700 text-xs font-bold font-montserrat uppercase rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            title="Apply or manage disciplinary points deductions"
          >
            <ShieldAlert size={14} />
            <span>Points Deduction</span>
          </button>

          {/* Sync from Fixtures */}
          <button
            onClick={handleSyncFixtures}
            className="px-3 py-1.5 bg-[#F8F9FA] hover:bg-white border border-[#E5E7EB] text-slate-700 text-xs font-bold font-montserrat uppercase rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            title="Recalculate standings table from matchday scores"
          >
            <RefreshCw size={13} />
            <span>Sync Results</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase rounded-md transition-colors cursor-pointer flex items-center gap-1.5 border border-[#1A1C1C]"
            title="Export official standings table to CSV"
          >
            <Download size={13} />
            <span>Export Table</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 min-w-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[860px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
                <th className="text-left px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Pos</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Club</th>
                {["P", "W", "D", "L", "GF", "GA", "GD", "Pen"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">
                    {h}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">Pts</th>
                <th className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-center">Form</th>
                <th className="px-3 py-2.5 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTable.map((row) => {
                const club = getClub(row.clubId);
                const gd = row.goalsFor - row.goalsAgainst;
                return (
                  <tr
                    key={row.clubId}
                    className={`border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#FAFBFB] transition-colors ${
                      row.zone === "PROMOTION" ? "bg-emerald-50/40" : row.zone === "RELEGATION" ? "bg-rose-50/40" : ""
                    }`}
                  >
                    {/* Position */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1 h-5 rounded-full ${
                            row.zone === "PROMOTION" ? "bg-emerald-500" : row.zone === "RELEGATION" ? "bg-rose-500" : "bg-transparent"
                          }`}
                        />
                        <span className="text-xs font-black font-montserrat text-slate-600">{row.position}</span>
                      </div>
                    </td>

                    {/* Club */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={club?.name ?? "Club"} size="sm" tone={row.position === 1 ? "gold" : "ink"} />
                        <div className="min-w-0">
                          <span className="text-xs font-bold font-montserrat text-[#1A1C1C] whitespace-nowrap block">
                            {club?.name ?? "Club"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{club?.region ?? "Division"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.played}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.won}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.drawn}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.lost}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.goalsFor}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.goalsAgainst}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
                      {gd > 0 ? `+${gd}` : gd}
                    </td>

                    {/* Penalty */}
                    <td className="px-3 py-3 text-center text-xs font-bold">
                      {row.pointsPenalty > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-black">
                          -{row.pointsPenalty}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Points */}
                    <td className="px-3 py-3 text-center text-sm font-black font-montserrat text-[#1A1C1C]">
                      {row.points}
                    </td>

                    {/* Form */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.map((r, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${FORM_STYLE[r]}`}
                            title={`Match ${i + 1}: ${r === "W" ? "Win" : r === "D" ? "Draw" : "Loss"}`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-right">
                      {row.pointsPenalty > 0 ? (
                        <button
                          onClick={() => handleRevokePenalty(row.clubId)}
                          className="text-[10.5px] font-bold text-rose-600 hover:text-black uppercase cursor-pointer"
                          title="Revoke points penalty"
                        >
                          Clear Pen
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setPenaltyClubId(row.clubId);
                            setIsPenaltyModalOpen(true);
                          }}
                          className="text-[10.5px] font-bold text-slate-400 hover:text-rose-600 uppercase cursor-pointer"
                          title="Deduct points"
                        >
                          - Pen
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-4 mt-2 border-t border-[#E5E7EB]">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Promotion / Championship Playoff
          </span>
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Relegation Zone
          </span>
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-200 border border-rose-400" /> Disciplinary Points Deduction Applied
          </span>
        </div>
      </div>

      {/* Disciplinary Points Penalty Modal */}
      {isPenaltyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={20} className="text-rose-600" />
                <div>
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Apply Points Penalty</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{division}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPenaltyModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplyPenalty} className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Club
                </label>
                <div className="relative">
                  <select
                    value={penaltyClubId}
                    onChange={(e) => setPenaltyClubId(e.target.value)}
                    className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                  >
                    {currentTable.map((r) => {
                      const c = getClub(r.clubId);
                      return (
                        <option key={r.clubId} value={r.clubId}>
                          {c?.name} (Current Pts: {r.points})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Points to Deduct
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={penaltyPoints}
                  onChange={(e) => setPenaltyPoints(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Sanction Reason
                </label>
                <select
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  <option value="Fielding Ineligible Player">Fielding Ineligible Player</option>
                  <option value="Administrative Misconduct">Administrative Misconduct / Forfeit</option>
                  <option value="Financial Compliance Breach">Financial Compliance Breach</option>
                  <option value="Violent Conduct / Bench Altercation">Violent Conduct / Bench Altercation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsPenaltyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                >
                  Confirm Penalty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
