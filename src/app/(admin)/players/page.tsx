"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Plus,
  Trash2,
  X,
  FileText,
  Activity,
  Shirt,
  ChevronDown,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { players as initialPlayers, clubs } from "@/lib/mockData";
import { formatDate, getCookie } from "@/lib/utils";
import type { Player, ScoutAttributes } from "@/lib/types";

function ageFromDob(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PlayersPage() {
  const [playersList, setPlayersList] = useState<Player[]>(initialPlayers);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState("ALL");
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [mvpOnly, setMvpOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(initialPlayers[0]?.id ?? "");

  // Modals state
  const [isEditAttributesOpen, setIsEditAttributesOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);

  // Form states for modals
  const [newScoutNote, setNewScoutNote] = useState("");
  const [newScoutName, setNewScoutName] = useState("Julia Tan");
  const [newMedicalLabel, setNewMedicalLabel] = useState("");
  const [newMedicalSeverity, setNewMedicalSeverity] = useState<"OK" | "WARNING">("OK");

  // Fetch real players from backend API
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      const res = await fetch(`${apiBaseUrl}/api/admin/players`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.players && Array.isArray(data.players) && data.players.length > 0) {
          setPlayersList(data.players);
          if (!selectedId || !data.players.some((p: Player) => p.id === selectedId)) {
            setSelectedId(data.players[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch players from backend API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Unique positions for filter
  const positions = useMemo(() => {
    const pSet = new Set<string>();
    playersList.forEach((p) => pSet.add(p.position));
    return Array.from(pSet);
  }, [playersList]);

  // Filtered player list
  const filtered = useMemo(() => {
    return playersList.filter((p) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        (p.teamName && p.teamName.toLowerCase().includes(q)) ||
        (p.nationality && p.nationality.toLowerCase().includes(q));

      const matchesClub = selectedClub === "ALL" || p.teamName === selectedClub || p.teamId === selectedClub;
      const matchesPosition = selectedPosition === "ALL" || p.position === selectedPosition;
      const matchesMvp = !mvpOnly || p.isMvpFeatured;

      return matchesQuery && matchesClub && matchesPosition && matchesMvp;
    });
  }, [playersList, query, selectedClub, selectedPosition, mvpOnly]);

  const selected = playersList.find((p) => p.id === selectedId) ?? filtered[0] ?? playersList[0];

  const radarData = selected
    ? [
        { attribute: "Pace", value: selected.attributes.pace },
        { attribute: "Shooting", value: selected.attributes.shooting },
        { attribute: "Passing", value: selected.attributes.passing },
        { attribute: "Dribbling", value: selected.attributes.dribbling },
        { attribute: "Defending", value: selected.attributes.defending },
        { attribute: "Physical", value: selected.attributes.physical },
      ]
    : [];

  const attributeRows: [string, number, keyof ScoutAttributes][] = selected
    ? [
        ["Pace", selected.attributes.pace, "pace"],
        ["Shooting", selected.attributes.shooting, "shooting"],
        ["Passing", selected.attributes.passing, "passing"],
        ["Dribbling", selected.attributes.dribbling, "dribbling"],
        ["Defending", selected.attributes.defending, "defending"],
        ["Physical", selected.attributes.physical, "physical"],
      ]
    : [];

  // Actions
  async function toggleMvp(playerId: string) {
    const current = playersList.find((p) => p.id === playerId);
    const nextMvp = !current?.isMvpFeatured;

    setPlayersList((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, isMvpFeatured: nextMvp } : p))
    );

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${playerId}/scout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isMvpFeatured: nextMvp }),
      });
      toast.success(nextMvp ? `${current?.fullName} featured as MVP Spotlight!` : `${current?.fullName} removed from MVP Spotlight.`);
    } catch (err) {
      console.error("MVP update error:", err);
      toast.success(nextMvp ? `${current?.fullName} featured as MVP Spotlight!` : `${current?.fullName} removed from MVP Spotlight.`);
    }
  }

  async function handleSaveAttributes(e: React.FormEvent, updatedGrade: number, updatedAttrs: ScoutAttributes) {
    e.preventDefault();
    if (!selected) return;

    setPlayersList((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              scoutGrade: updatedGrade,
              attributes: updatedAttrs,
            }
          : p
      )
    );
    setIsEditAttributesOpen(false);
    toast.success(`Scout ratings updated for ${selected.fullName}!`);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${selected.id}/scout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          scoutGrade: updatedGrade,
          attributes: updatedAttrs,
        }),
      });
    } catch (err) {
      console.error("Attribute update error:", err);
    }
  }

  async function handleAddScoutNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !newScoutNote.trim()) {
      toast.error("Please enter scout note text.");
      return;
    }
    const note = newScoutNote.trim();
    const scout = newScoutName.trim() || "Lead Scout";
    const date = new Date().toISOString().split("T")[0];

    setPlayersList((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              scoutNote: note,
              scoutedBy: scout,
              scoutedAt: date,
            }
          : p
      )
    );
    setIsAddNoteOpen(false);
    setNewScoutNote("");
    toast.success(`Scout note logged for ${selected.fullName}!`);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${selected.id}/scout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          scoutNote: note,
          scoutedBy: scout,
          scoutedAt: date,
        }),
      });
    } catch (err) {
      console.error("Scout note error:", err);
    }
  }

  async function handleAddMedicalFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !newMedicalLabel.trim()) {
      toast.error("Please enter medical flag description.");
      return;
    }
    const newFlag = { label: newMedicalLabel.trim(), severity: newMedicalSeverity };
    const updatedFlags = [...selected.medicalFlags, newFlag];

    setPlayersList((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              medicalFlags: updatedFlags,
            }
          : p
      )
    );
    setNewMedicalLabel("");
    toast.success(`Medical flag recorded for ${selected.fullName}`);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${selected.id}/medical`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ medicalFlags: updatedFlags }),
      });
    } catch (err) {
      console.error("Medical flag error:", err);
    }
  }

  async function handleDeleteMedicalFlag(flagLabel: string) {
    if (!selected) return;
    const updatedFlags = selected.medicalFlags.filter((f) => f.label !== flagLabel);

    setPlayersList((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              medicalFlags: updatedFlags,
            }
          : p
      )
    );
    toast.success("Medical flag cleared.");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${selected.id}/medical`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ medicalFlags: updatedFlags }),
      });
    } catch (err) {
      console.error("Medical flag delete error:", err);
    }
  }

  async function handleSaveKit(e: React.FormEvent, shirt: string, shorts: string, socks: string) {
    e.preventDefault();
    if (!selected) return;

    setPlayersList((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              shirtSize: shirt,
              shortsSize: shorts,
              sockSize: socks,
            }
          : p
      )
    );
    setIsKitModalOpen(false);
    toast.success(`Kit & apparel sizing updated for ${selected.fullName}!`);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/admin/players/${selected.id}/kit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ shirtSize: shirt, shortsSize: shorts, sockSize: socks }),
      });
    } catch (err) {
      console.error("Kit size update error:", err);
    }
  }

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader
        eyebrow="Scouting & Roster Network"
        title="Players & Scouting"
        subtitle={`${playersList.length} prospects tracked across all league clubs`}
        action={
          <button
            onClick={() => {
              fetchPlayers();
              toast.success("Prospects directory synchronized");
            }}
            disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1A1C1C] disabled:opacity-50"
          >
            <RefreshCw size={15} className={`text-[#FFB800] ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Prospects</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-md border border-[#E5E7EB] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prospect by name, nationality or role..."
            className="w-full pl-9 pr-8 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-semibold text-[#1A1C1C] placeholder:text-slate-400 focus:outline-none focus:border-[#FFB800]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Club Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md pl-3 pr-8 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
            >
              <option value="ALL">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Position Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md pl-3 pr-8 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
            >
              <option value="ALL">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* MVP Spotlight Filter Toggle */}
          <button
            onClick={() => setMvpOnly(!mvpOnly)}
            className={`px-3 py-2 rounded-md text-xs font-bold font-montserrat uppercase flex items-center gap-1.5 transition-colors cursor-pointer border ${
              mvpOnly ? "bg-[#1A1C1C] text-[#FFB800] border-[#1A1C1C]" : "bg-[#F8F9FA] border-[#E5E7EB] text-slate-500 hover:text-black"
            }`}
          >
            <Sparkles size={13} className={mvpOnly ? "text-[#FFB800]" : "text-slate-400"} />
            <span>MVP Spotlight</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start min-w-0">
        {/* Left Prospects List */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-2 space-y-1 max-h-[720px] overflow-y-auto custom-scrollbar min-w-0">
          <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between">
            <span className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">
              Prospects ({filtered.length})
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <p className="text-xs font-bold font-montserrat text-slate-500">No prospects match filter</p>
              <p className="text-[11px]">Clear search or select &apos;All Clubs&apos;.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors cursor-pointer ${
                  selected?.id === p.id ? "bg-[#FFF9E6] border border-[#FFB800]/50" : "hover:bg-[#F8F9FA] border border-transparent"
                }`}
              >
                <Avatar name={p.fullName} size="sm" tone={selected?.id === p.id ? "gold" : "ink"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{p.fullName}</p>
                    {p.isMvpFeatured && <Sparkles size={11} className="text-[#FFB800] shrink-0" />}
                  </div>
                  <p className="text-[10.5px] text-slate-400 font-semibold truncate">
                    {p.position} · {p.teamName}
                  </p>
                </div>
                <span className="text-xs font-black font-montserrat text-[#7C5800] bg-[#FFF9E6] px-1.5 py-0.5 rounded shrink-0">
                  {p.scoutGrade ?? "—"}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Right Detail & Scouting Card */}
        {selected && (
          <div className="space-y-6 min-w-0">
            {/* Header Profile Bar */}
            <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={selected.fullName} size="lg" tone="ink" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-black font-montserrat uppercase text-[#1A1C1C]">{selected.fullName}</h2>
                    <span className="px-1.5 py-0.5 bg-[#1A1C1C] text-[#FFB800] rounded text-[10px] font-black font-montserrat">
                      #{selected.jerseyNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {selected.position} · {selected.teamName} · Age {ageFromDob(selected.dateOfBirth)} · {selected.nationality ?? "UK"}
                  </p>
                </div>
              </div>

              {/* MVP Spotlight Button */}
              <button
                onClick={() => toggleMvp(selected.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-colors cursor-pointer shrink-0 ${
                  selected.isMvpFeatured ? "bg-[#FFF9E6] border-[#FFB800]/70" : "bg-[#F8F9FA] border-[#E5E7EB]"
                }`}
              >
                <span
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    selected.isMvpFeatured ? "bg-[#FFB800]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all ${
                      selected.isMvpFeatured ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
                <span className="text-left">
                  <span className="flex items-center gap-1 text-xs font-extrabold font-montserrat text-[#1A1C1C]">
                    <Sparkles size={13} className={selected.isMvpFeatured ? "text-[#FFB800]" : "text-slate-400"} />
                    <span>MVP Spotlight</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400">Featured on public site</span>
                </span>
              </button>
            </div>

            {/* Radar and Attribute Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Scout Radar Analysis</h3>
                  <span className="text-xs font-black font-montserrat text-[#7C5800] bg-[#FFF9E6] px-2 py-0.5 rounded border border-[#FFB800]/40">
                    Grade: {selected.scoutGrade ?? "N/A"}
                  </span>
                </div>
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

              {/* Attribute Breakdown with Edit Trigger */}
              <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Attribute Breakdown</h3>
                  <button
                    onClick={() => setIsEditAttributesOpen(true)}
                    className="text-[10.5px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>Edit Ratings</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {attributeRows.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-bold font-montserrat text-slate-600">{label}</span>
                      <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#7C5800]"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="w-7 text-right text-xs font-black font-montserrat text-[#1A1C1C]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom 3 Cards: Kit, Medical Flags, Scout Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kit & Equipment */}
              <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Kit &amp; Equipment</h3>
                  <button
                    onClick={() => setIsKitModalOpen(true)}
                    className="text-[10px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
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

              {/* Medical Flags */}
              <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Medical Clearance</h3>
                  <button
                    onClick={() => setIsMedicalModalOpen(true)}
                    className="text-[10px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase cursor-pointer"
                  >
                    + Flag
                  </button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {selected.medicalFlags.length === 0 ? (
                    <p className="text-xs text-slate-400">No medical records filed.</p>
                  ) : (
                    selected.medicalFlags.map((flag) => (
                      <div
                        key={flag.label}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[11px] font-bold font-montserrat ${
                          flag.severity === "OK" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {flag.severity === "OK" ? <CheckCircle2 size={14} className="shrink-0" /> : <AlertTriangle size={14} className="shrink-0" />}
                          <span className="truncate">{flag.label}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMedicalFlag(flag.label)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Remove medical flag"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Scout Notes */}
              <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Scout Observations</h3>
                  <button
                    onClick={() => setIsAddNoteOpen(true)}
                    className="text-[10px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase cursor-pointer"
                  >
                    + Add Note
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{selected.scoutNote || "No observations logged yet."}&rdquo;
                </p>
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
        )}
      </div>

      {/* Edit Attributes Modal */}
      {isEditAttributesOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div>
                <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Edit Scout Ratings &amp; Attributes</h3>
                <p className="text-[11px] text-slate-500 font-medium">{selected.fullName} · {selected.position}</p>
              </div>
              <button onClick={() => setIsEditAttributesOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                const form = e.currentTarget;
                const grade = Number((form.elements.namedItem("scoutGrade") as HTMLInputElement).value);
                const attrs: ScoutAttributes = {
                  pace: Number((form.elements.namedItem("pace") as HTMLInputElement).value),
                  shooting: Number((form.elements.namedItem("shooting") as HTMLInputElement).value),
                  passing: Number((form.elements.namedItem("passing") as HTMLInputElement).value),
                  dribbling: Number((form.elements.namedItem("dribbling") as HTMLInputElement).value),
                  defending: Number((form.elements.namedItem("defending") as HTMLInputElement).value),
                  physical: Number((form.elements.namedItem("physical") as HTMLInputElement).value),
                };
                handleSaveAttributes(e, grade, attrs);
              }}
              className="p-5 space-y-4"
            >
              <div className="bg-[#FFF9E6] border border-[#FFB800]/40 rounded-md p-3">
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-[#7C5800] mb-1">
                  Overall Scout Grade (0 – 99)
                </label>
                <input
                  type="number"
                  name="scoutGrade"
                  min={1}
                  max={99}
                  defaultValue={selected.scoutGrade ?? 85}
                  required
                  className="w-full bg-white border border-[#FFB800] rounded px-3 py-1.5 text-sm font-black text-[#1A1C1C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {attributeRows.map(([label, value, key]) => (
                  <div key={key}>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                      {label} (0-99)
                    </label>
                    <input
                      type="number"
                      name={key}
                      min={1}
                      max={99}
                      defaultValue={value}
                      required
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded px-3 py-1.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditAttributesOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                >
                  Save Ratings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Scout Note Modal */}
      {isAddNoteOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Log Scout Observation</h3>
              <button onClick={() => setIsAddNoteOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddScoutNote} className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Scout Name
                </label>
                <input
                  type="text"
                  value={newScoutName}
                  onChange={(e) => setNewScoutName(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Trial Notes &amp; Observations *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record player's positioning, tactical discipline, work rate, and technical strengths..."
                  value={newScoutNote}
                  onChange={(e) => setNewScoutNote(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 text-xs font-medium text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medical Flag Modal */}
      {isMedicalModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Add Medical Flag</h3>
              <button onClick={() => setIsMedicalModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => { handleAddMedicalFlag(e); setIsMedicalModalOpen(false); }} className="p-5 space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Flag Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleared for 60 Mins, Ankle Sprain"
                  value={newMedicalLabel}
                  onChange={(e) => setNewMedicalLabel(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Severity Type
                </label>
                <select
                  value={newMedicalSeverity}
                  onChange={(e) => setNewMedicalSeverity(e.target.value as "OK" | "WARNING")}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  <option value="OK">Clearance (OK / Fit to Play)</option>
                  <option value="WARNING">Precautionary Flag (Monitor / Limited)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsMedicalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                >
                  Add Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Kit Sizing Modal */}
      {isKitModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Edit Kit &amp; Apparel Sizing</h3>
              <button onClick={() => setIsKitModalOpen(false)} className="text-slate-400 hover:text-black cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                const form = e.currentTarget;
                const shirt = (form.elements.namedItem("shirt") as HTMLSelectElement).value;
                const shorts = (form.elements.namedItem("shorts") as HTMLSelectElement).value;
                const socks = (form.elements.namedItem("socks") as HTMLSelectElement).value;
                handleSaveKit(e, shirt, shorts, socks);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Jersey / Shirt Size
                </label>
                <select
                  name="shirt"
                  defaultValue={selected.shirtSize ?? "M"}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Shorts Size
                </label>
                <select
                  name="shorts"
                  defaultValue={selected.shortsSize ?? "M"}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Sock Size
                </label>
                <select
                  name="socks"
                  defaultValue={selected.sockSize ?? "Standard"}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  <option value="Small (3-6)">Small (3-6)</option>
                  <option value="Standard">Standard (7-11)</option>
                  <option value="Large (11-14)">Large (11-14)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsKitModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                >
                  Save Sizing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
