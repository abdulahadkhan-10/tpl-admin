"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Minus,
  MapPin,
  Clock,
  CalendarDays,
  ChevronDown,
  Search,
  Trash2,
  X,
  Play,
  CheckCircle2,
  Edit3,
  PauseCircle,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { clubs, fixtures as initialFixtures, getClub, getStaff, staffDirectory, players } from "@/lib/mockData";
import { formatDate, formatTime, getCookie } from "@/lib/utils";
import type { Fixture, FixtureStatus, GoalEvent, CardEvent } from "@/lib/types";

const TABS: { id: "ALL" | FixtureStatus; label: string }[] = [
  { id: "ALL", label: "All Fixtures" },
  { id: "LIVE", label: "Live" },
  { id: "SCHEDULED", label: "Upcoming" },
  { id: "FULL_TIME", label: "Completed" },
  { id: "POSTPONED", label: "Postponed" },
];

const CARD_REASONS = [
  "Tactical Foul",
  "Reckless Tackle",
  "Dissent",
  "Violent Conduct",
  "2nd Yellow Card",
  "Delaying Restart",
  "Handball",
  "Other",
];

// Clean Vector Goal / Soccer Ball Icon (No raw emojis)
function GoalIcon({ className = "w-3.5 h-3.5 text-slate-700" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 16 10 14.5 15 9.5 15 8 10" fill="currentColor" fillOpacity="0.2" />
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="21.5" y1="8.5" x2="16" y2="10" />
      <line x1="18" y1="20" x2="14.5" y2="15" />
      <line x1="6" y1="20" x2="9.5" y2="15" />
      <line x1="2.5" y1="8.5" x2="8" y2="10" />
    </svg>
  );
}

// Clean Vector Disciplinary Card Icon (No raw emojis)
function CardIcon({ type, className = "w-2.5 h-3.5" }: { type: "YELLOW" | "RED"; className?: string }) {
  return (
    <span
      className={`inline-block rounded-xs shadow-2xs shrink-0 ${
        type === "YELLOW"
          ? "bg-amber-400 border border-amber-500/90"
          : "bg-rose-600 border border-rose-700/90"
      } ${className}`}
    />
  );
}

export default function FixturesPage() {
  const [tab, setTab] = useState<"ALL" | FixtureStatus>("ALL");
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("ALL");

  // Event Logger Modal State (Goals & Cards)
  const [eventModal, setEventModal] = useState<{
    open: boolean;
    fixtureId: string;
    clubId: string;
    side: "home" | "away";
    initialType?: "GOAL" | "YELLOW" | "RED";
  } | null>(null);

  const [eventType, setEventType] = useState<"GOAL" | "YELLOW" | "RED">("GOAL");
  const [playerName, setPlayerName] = useState("");
  const [eventMinute, setEventMinute] = useState(45);
  const [goalType, setGoalType] = useState<"REGULAR" | "PENALTY" | "OWN_GOAL">("REGULAR");
  const [assistName, setAssistName] = useState("");
  const [cardReason, setCardReason] = useState(CARD_REASONS[0]);

  // Edit Fixture Modal State
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

  // New Fixture Form State
  const [homeClubId, setHomeClubId] = useState(clubs[0]?.id ?? "");
  const [awayClubId, setAwayClubId] = useState(clubs[1]?.id ?? "");
  const [kickoffDate, setKickoffDate] = useState("2026-08-25");
  const [kickoffTime, setKickoffTime] = useState("15:00");
  const [venue, setVenue] = useState("Riverside Park");
  const [pitch, setPitch] = useState("Pitch 1");
  const [refereeId, setRefereeId] = useState(staffDirectory.find((s) => s.role === "REFEREE")?.id ?? "");
  const [commissionerId, setCommissionerId] = useState(staffDirectory.find((s) => s.role === "COMMISSIONER")?.id ?? "");

  // Fetch real fixtures from backend API
  const fetchFixtures = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBaseUrl}/api/fixtures`);
      if (res.ok) {
        const data = await res.json();
        if (data.fixtures && Array.isArray(data.fixtures) && data.fixtures.length > 0) {
          setFixtures(data.fixtures);
        }
      }
    } catch (err) {
      console.error("Failed to fetch fixtures from backend API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  // Unique venues for filter dropdown
  const uniqueVenues = useMemo(() => {
    const vSet = new Set<string>();
    fixtures.forEach((f) => vSet.add(f.venue));
    return Array.from(vSet);
  }, [fixtures]);

  // Filtered Fixtures
  const visible = useMemo(() => {
    return fixtures.filter((f) => {
      // Tab filter
      const matchesTab = tab === "ALL" || f.status === tab;
      // Search filter (team names or venue)
      const homeName = getClub(f.homeClubId)?.name.toLowerCase() ?? "";
      const awayName = getClub(f.awayClubId)?.name.toLowerCase() ?? "";
      const venueName = f.venue.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || homeName.includes(q) || awayName.includes(q) || venueName.includes(q);
      // Venue filter
      const matchesVenue = selectedVenue === "ALL" || f.venue === selectedVenue;

      return matchesTab && matchesSearch && matchesVenue;
    });
  }, [fixtures, tab, searchQuery, selectedVenue]);

  const liveCount = fixtures.filter((f) => f.status === "LIVE").length;

  // Lifecycle Controls
  async function startMatch(id: string) {
    setFixtures((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: "LIVE",
              minute: 1,
              homeScore: f.homeScore ?? 0,
              awayScore: f.awayScore ?? 0,
            }
          : f
      )
    );
    toast.success("Match started! Live tracking active.");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: "LIVE",
          minute: 1,
          homeScore: 0,
          awayScore: 0,
        }),
      });
    } catch (err) {
      console.error("Failed to start match on backend:", err);
    }
  }

  async function endMatch(id: string) {
    setFixtures((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: "FULL_TIME",
              minute: 90,
            }
          : f
      )
    );
    toast.success("Match concluded (Full Time)!");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: "FULL_TIME",
          minute: 90,
        }),
      });
    } catch (err) {
      console.error("Failed to conclude match on backend:", err);
    }
  }

  async function postponeMatch(id: string) {
    setFixtures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "POSTPONED" } : f))
    );
    toast.success("Match marked as Postponed.");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "POSTPONED" }),
      });
    } catch (err) {
      console.error("Failed to postpone match on backend:", err);
    }
  }

  async function deleteFixture(id: string) {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
    toast.success("Fixture deleted.");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error("Failed to delete fixture on backend:", err);
    }
  }

  // Open Event Modal (Goal or Card)
  function openAddEventModal(fixtureId: string, clubId: string, side: "home" | "away", type: "GOAL" | "YELLOW" | "RED", currentMinute: number | null) {
    const clubPlayers = players.filter((p) => p.teamId === clubId);
    setEventModal({ open: true, fixtureId, clubId, side, initialType: type });
    setEventType(type);
    setPlayerName(clubPlayers[0]?.fullName ?? "");
    setEventMinute(currentMinute ?? 45);
    setGoalType("REGULAR");
    setAssistName("");
    setCardReason(CARD_REASONS[0]);
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventModal || !playerName.trim()) {
      toast.error("Please select or enter a player name.");
      return;
    }

    const { fixtureId, clubId, side } = eventModal;

    if (eventType === "GOAL") {
      const newGoal: GoalEvent = {
        id: `goal-${Date.now()}`,
        fixtureId,
        clubId,
        scorerName: playerName.trim(),
        minute: Number(eventMinute) || 1,
        type: goalType,
        assistName: assistName.trim() || null,
      };

      setFixtures((prev) =>
        prev.map((f) => {
          if (f.id !== fixtureId) return f;
          const key = side === "home" ? "homeScore" : "awayScore";
          const nextScore = (f[key] ?? 0) + 1;
          const existingGoals = f.goals ?? [];
          return {
            ...f,
            [key]: nextScore,
            goals: [...existingGoals, newGoal],
          };
        })
      );
      toast.success(`Goal logged for ${playerName} (${eventMinute}')!`);

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = getCookie("tpl_admin_token");
        await fetch(`${apiBaseUrl}/api/fixtures/${fixtureId}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: "GOAL",
            side,
            eventData: {
              clubId,
              scorerName: playerName.trim(),
              minute: Number(eventMinute) || 1,
              type: goalType,
              assistName: assistName.trim() || null,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to record goal on backend:", err);
      }
    } else {
      const newCard: CardEvent = {
        id: `card-${Date.now()}`,
        fixtureId,
        clubId,
        playerName: playerName.trim(),
        minute: Number(eventMinute) || 1,
        cardType: eventType,
        reason: cardReason,
      };

      setFixtures((prev) =>
        prev.map((f) => {
          if (f.id !== fixtureId) return f;
          const existingCards = f.cards ?? [];
          return {
            ...f,
            cards: [...existingCards, newCard],
          };
        })
      );
      toast.success(`${eventType === "YELLOW" ? "Yellow Card" : "Red Card"} issued to ${playerName} (${eventMinute}')!`);

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = getCookie("tpl_admin_token");
        await fetch(`${apiBaseUrl}/api/fixtures/${fixtureId}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: eventType,
            side,
            eventData: {
              clubId,
              playerName: playerName.trim(),
              minute: Number(eventMinute) || 1,
              reason: cardReason,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to record card on backend:", err);
      }
    }

    setEventModal(null);
  }

  function removeLatestGoal(fixtureId: string, clubId: string, side: "home" | "away") {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== fixtureId) return f;
        const key = side === "home" ? "homeScore" : "awayScore";
        const currentScore = f[key] ?? 0;
        if (currentScore <= 0) return f;

        const existingGoals = f.goals ?? [];
        const lastGoalIndex = existingGoals.map((g) => g.clubId).lastIndexOf(clubId);
        let updatedGoals = [...existingGoals];
        if (lastGoalIndex !== -1) {
          updatedGoals.splice(lastGoalIndex, 1);
        }

        return {
          ...f,
          [key]: Math.max(0, currentScore - 1),
          goals: updatedGoals,
        };
      })
    );
    toast.success("Goal removed.");
  }

  function deleteSpecificGoal(fixtureId: string, goalId: string, side: "home" | "away") {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== fixtureId) return f;
        const key = side === "home" ? "homeScore" : "awayScore";
        const currentScore = f[key] ?? 0;
        const updatedGoals = (f.goals ?? []).filter((g) => g.id !== goalId);
        return {
          ...f,
          [key]: Math.max(0, currentScore - 1),
          goals: updatedGoals,
        };
      })
    );
    toast.success("Goal event removed.");
  }

  function deleteSpecificCard(fixtureId: string, cardId: string) {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== fixtureId) return f;
        return {
          ...f,
          cards: (f.cards ?? []).filter((c) => c.id !== cardId),
        };
      })
    );
    toast.success("Disciplinary card removed.");
  }

  // Edit Fixture Submit
  async function handleSaveEditFixture(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFixture) return;

    setFixtures((prev) =>
      prev.map((f) => (f.id === editingFixture.id ? editingFixture : f))
    );
    toast.success("Fixture details updated successfully!");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures/${editingFixture.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editingFixture),
      });
    } catch (err) {
      console.error("Failed to update fixture on backend:", err);
    }

    setEditingFixture(null);
  }

  // Create New Fixture Form Submit
  async function handleScheduleFixture(e: React.FormEvent) {
    e.preventDefault();
    if (!homeClubId || !awayClubId) {
      toast.error("Please select both home and away clubs.");
      return;
    }
    if (homeClubId === awayClubId) {
      toast.error("Home and Away clubs cannot be the same.");
      return;
    }
    if (!kickoffDate || !kickoffTime) {
      toast.error("Please specify a match date and kick-off time.");
      return;
    }

    const isoDate = `${kickoffDate}T${kickoffTime}:00Z`;
    const newFixture: Fixture = {
      id: `fx-${Date.now()}`,
      homeClubId,
      awayClubId,
      kickoff: isoDate,
      venue: venue.trim() || "Main Ground",
      pitch: pitch.trim() || "Pitch 1",
      refereeId: refereeId || null,
      commissionerId: commissionerId || null,
      status: "SCHEDULED",
      homeScore: null,
      awayScore: null,
      minute: null,
      goals: [],
      cards: [],
    };

    setFixtures((prev) => [newFixture, ...prev]);
    toast.success("New fixture scheduled successfully!");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = getCookie("tpl_admin_token");
      await fetch(`${apiBaseUrl}/api/fixtures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newFixture),
      });
    } catch (err) {
      console.error("Failed to save fixture to backend:", err);
    }
  }

  const activeClubForModal = eventModal ? getClub(eventModal.clubId) : null;
  const activeClubPlayers = eventModal ? players.filter((p) => p.teamId === eventModal.clubId) : [];

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader eyebrow="Matchday Operations" title="Fixtures & Matches" subtitle="Matchday 14 · Premier Division" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-md border border-[#E5E7EB] shadow-xs">
        {/* Status Tabs */}
        <div className="flex gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.id ? "bg-[#1A1C1C] text-[#FFB800] shadow-xs" : "text-slate-500 hover:text-black hover:bg-white"
              }`}
            >
              {t.label} {t.id === "LIVE" && liveCount > 0 ? `(${liveCount})` : ""}
            </button>
          ))}
        </div>

        {/* Search & Venue Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club or venue..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-semibold text-[#1A1C1C] placeholder:text-slate-400 focus:outline-none focus:border-[#FFB800]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Venue Dropdown */}
          <div className="relative">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md pl-3 pr-8 py-1.5 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
            >
              <option value="ALL">All Venues</option>
              {uniqueVenues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start min-w-0">
        {/* Fixtures List */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs divide-y divide-[#E5E7EB] min-w-0 overflow-hidden">
          {visible.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CalendarDays size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold font-montserrat uppercase text-slate-500">No fixtures found</p>
              <p className="text-[11px] text-slate-400">There are no fixtures matching the current search &amp; filter criteria.</p>
            </div>
          ) : (
            visible.map((fx) => {
              const home = getClub(fx.homeClubId);
              const away = getClub(fx.awayClubId);
              const referee = getStaff(fx.refereeId);

              const homeGoals = (fx.goals ?? []).filter((g) => g.clubId === fx.homeClubId);
              const awayGoals = (fx.goals ?? []).filter((g) => g.clubId === fx.awayClubId);
              const homeCards = (fx.cards ?? []).filter((c) => c.clubId === fx.homeClubId);
              const awayCards = (fx.cards ?? []).filter((c) => c.clubId === fx.awayClubId);

              const hasEvents = homeGoals.length > 0 || awayGoals.length > 0 || homeCards.length > 0 || awayCards.length > 0;

              return (
                <div
                  key={fx.id}
                  className="p-4 sm:p-5 hover:bg-[#FAFBFB] transition-colors space-y-3"
                >
                  {/* Top Meta Bar: Date/Time, Venue, Referee, Actions & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-semibold text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
                        <CalendarDays size={13} className="text-slate-400 shrink-0" />
                        {fx.status === "SCHEDULED"
                          ? `${formatDate(fx.kickoff)} · ${formatTime(fx.kickoff)}`
                          : fx.status === "LIVE"
                          ? "Live Match"
                          : fx.status === "POSTPONED"
                          ? `Postponed · ${formatDate(fx.kickoff)}`
                          : `Full Time · ${formatDate(fx.kickoff)}`}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        {fx.venue} · {fx.pitch}
                      </span>
                      <span className="text-slate-300 hidden md:inline">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        {referee ? `Ref: ${referee.fullName}` : "Referee TBC"}
                      </span>
                    </div>

                    {/* Status Pill & Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* Lifecycle Action Buttons */}
                      {(fx.status === "SCHEDULED" || fx.status === "POSTPONED") && (
                        <button
                          onClick={() => startMatch(fx.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-bold font-montserrat uppercase transition-colors cursor-pointer shadow-2xs"
                          title="Kick-off Match (Set to Live)"
                        >
                          <Play size={11} className="fill-white" />
                          <span>Start Match</span>
                        </button>
                      )}

                      {fx.status === "LIVE" && (
                        <button
                          onClick={() => endMatch(fx.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1A1C1C] hover:bg-black text-[#FFB800] rounded text-[10.5px] font-bold font-montserrat uppercase transition-colors cursor-pointer border border-[#1A1C1C]"
                          title="Conclude match at Full Time"
                        >
                          <CheckCircle2 size={12} />
                          <span>End Match (FT)</span>
                        </button>
                      )}

                      {fx.status === "SCHEDULED" && (
                        <button
                          onClick={() => postponeMatch(fx.id)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Postpone Match"
                        >
                          <PauseCircle size={14} />
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingFixture(fx)}
                        className="p-1 rounded text-slate-400 hover:text-black hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                        title="Edit Fixture Details"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteFixture(fx.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Fixture"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Status Badge */}
                      {fx.status === "LIVE" && <StatusPill label={`LIVE ${fx.minute}'`} tone="danger" pulse />}
                      {fx.status === "SCHEDULED" && <StatusPill label="Scheduled" tone="info" dot={false} />}
                      {fx.status === "FULL_TIME" && <StatusPill label="Full Time" tone="neutral" dot={false} />}
                      {fx.status === "POSTPONED" && <StatusPill label="Postponed" tone="warning" dot={false} />}
                    </div>
                  </div>

                  {/* Main Match Fixture Row */}
                  <div className="bg-[#F8F9FA] border border-[#E5E7EB]/80 rounded-lg p-3 sm:p-4 space-y-2.5">
                    {/* Teams and Score Center */}
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      {/* Home Club */}
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end min-w-0">
                        <span className="text-xs sm:text-sm md:text-base font-extrabold font-montserrat text-[#1A1C1C] text-right">
                          {home?.name ?? "Club"}
                        </span>
                        <div className="shrink-0">
                          <Avatar name={home?.name ?? "Club"} size="md" tone="ink" />
                        </div>
                      </div>

                      {/* Center Score / VS Display & Live Controls */}
                      <div className="flex flex-col items-center justify-center gap-1 shrink-0 px-2 sm:px-4 min-w-[76px] sm:min-w-[96px]">
                        {fx.status === "SCHEDULED" || fx.status === "POSTPONED" ? (
                          <span className="text-xs sm:text-sm font-black font-montserrat text-slate-400 tracking-wider bg-white border border-[#E5E7EB] px-2.5 py-1 rounded shadow-xs">
                            {fx.status === "POSTPONED" ? "PPD" : "VS"}
                          </span>
                        ) : (
                          <span className="text-lg sm:text-2xl font-black font-montserrat text-[#1A1C1C] tracking-tight">
                            {fx.homeScore} – {fx.awayScore}
                          </span>
                        )}

                        {fx.status === "LIVE" && (
                          <div className="flex flex-col items-center gap-1.5 mt-0.5">
                            {/* Score Adjuster Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Home Score +/- */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => removeLatestGoal(fx.id, fx.homeClubId, "home")}
                                  className="w-5 h-5 rounded bg-white border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800] text-slate-600 hover:text-black shadow-xs transition-colors"
                                  title="Remove Home Goal (-1)"
                                >
                                  <Minus size={10} />
                                </button>
                                <button
                                  onClick={() => openAddEventModal(fx.id, fx.homeClubId, "home", "GOAL", fx.minute)}
                                  className="w-5 h-5 rounded bg-white border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800] text-slate-600 hover:text-black shadow-xs transition-colors"
                                  title="Log Goal for Home Club (+1)"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              {/* Away Score +/- */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => removeLatestGoal(fx.id, fx.awayClubId, "away")}
                                  className="w-5 h-5 rounded bg-white border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800] text-slate-600 hover:text-black shadow-xs transition-colors"
                                  title="Remove Away Goal (-1)"
                                >
                                  <Minus size={10} />
                                </button>
                                <button
                                  onClick={() => openAddEventModal(fx.id, fx.awayClubId, "away", "GOAL", fx.minute)}
                                  className="w-5 h-5 rounded bg-white border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#FFB800] text-slate-600 hover:text-black shadow-xs transition-colors"
                                  title="Log Goal for Away Club (+1)"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>

                            {/* Card Issuing Quick Triggers */}
                            <div className="flex items-center gap-2 text-[10.5px]">
                              <button
                                onClick={() => openAddEventModal(fx.id, fx.homeClubId, "home", "YELLOW", fx.minute)}
                                className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] hover:border-amber-400 font-bold text-amber-800 flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Issue Yellow/Red Card to Home Player"
                              >
                                <Plus size={10} />
                                <CardIcon type="YELLOW" />
                              </button>
                              <button
                                onClick={() => openAddEventModal(fx.id, fx.awayClubId, "away", "YELLOW", fx.minute)}
                                className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] hover:border-amber-400 font-bold text-amber-800 flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Issue Yellow/Red Card to Away Player"
                              >
                                <Plus size={10} />
                                <CardIcon type="YELLOW" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Away Club */}
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div className="shrink-0">
                          <Avatar name={away?.name ?? "Club"} size="md" tone="muted" />
                        </div>
                        <span className="text-xs sm:text-sm md:text-base font-extrabold font-montserrat text-[#1A1C1C]">
                          {away?.name ?? "Club"}
                        </span>
                      </div>
                    </div>

                    {/* Match Events: Goalscorers & Disciplinary Cards */}
                    {hasEvents && (
                      <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-[#E5E7EB]/70 text-[11px]">
                        {/* Home Club Events */}
                        <div className="flex-1 flex flex-wrap items-center justify-end gap-1.5 min-w-0 text-right">
                          {homeGoals.length === 0 && homeCards.length === 0 ? (
                            <span className="text-[10.5px] text-slate-300 italic">—</span>
                          ) : (
                            <>
                              {/* Goals */}
                              {homeGoals.map((g) => (
                                <div
                                  key={g.id}
                                  className="group relative inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-full shadow-2xs hover:border-[#FFB800] transition-colors"
                                >
                                  <GoalIcon className="w-3 h-3 text-slate-700" />
                                  <span className="font-bold text-[#1A1C1C]">{g.scorerName}</span>
                                  <span className="text-[9.5px] font-extrabold text-[#7C5800] bg-[#FFF9E6] px-1 rounded">
                                    {g.minute}&apos;
                                  </span>
                                  {g.type === "PENALTY" && <span className="text-[9px] font-bold text-amber-600">(P)</span>}
                                  {g.type === "OWN_GOAL" && <span className="text-[9px] font-bold text-rose-600">(OG)</span>}
                                  {fx.status === "LIVE" && (
                                    <button
                                      onClick={() => deleteSpecificGoal(fx.id, g.id, "home")}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 ml-0.5 transition-opacity cursor-pointer"
                                      title="Delete goal"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {/* Cards */}
                              {homeCards.map((c) => (
                                <div
                                  key={c.id}
                                  title={c.reason ?? "Disciplinary card"}
                                  className={`group relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-2xs border ${
                                    c.cardType === "YELLOW"
                                      ? "bg-amber-50/90 border-amber-300 text-amber-900"
                                      : "bg-rose-50/90 border-rose-300 text-rose-900"
                                  }`}
                                >
                                  <CardIcon type={c.cardType} />
                                  <span className="font-bold">{c.playerName}</span>
                                  <span className="text-[9.5px] font-bold opacity-75">{c.minute}&apos;</span>
                                  {fx.status === "LIVE" && (
                                    <button
                                      onClick={() => deleteSpecificCard(fx.id, c.id)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 ml-0.5 transition-opacity cursor-pointer"
                                      title="Delete card"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Center Events Tag */}
                        <div className="shrink-0 flex items-center justify-center px-1 text-slate-300">
                          <span className="text-[9px] font-extrabold font-montserrat uppercase tracking-wider text-slate-400 bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded">
                            Events
                          </span>
                        </div>

                        {/* Away Club Events */}
                        <div className="flex-1 flex flex-wrap items-center justify-start gap-1.5 min-w-0 text-left">
                          {awayGoals.length === 0 && awayCards.length === 0 ? (
                            <span className="text-[10.5px] text-slate-300 italic">—</span>
                          ) : (
                            <>
                              {/* Goals */}
                              {awayGoals.map((g) => (
                                <div
                                  key={g.id}
                                  className="group relative inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-full shadow-2xs hover:border-[#FFB800] transition-colors"
                                >
                                  <GoalIcon className="w-3 h-3 text-slate-700" />
                                  <span className="font-bold text-[#1A1C1C]">{g.scorerName}</span>
                                  <span className="text-[9.5px] font-extrabold text-[#7C5800] bg-[#FFF9E6] px-1 rounded">
                                    {g.minute}&apos;
                                  </span>
                                  {g.type === "PENALTY" && <span className="text-[9px] font-bold text-amber-600">(P)</span>}
                                  {g.type === "OWN_GOAL" && <span className="text-[9px] font-bold text-rose-600">(OG)</span>}
                                  {fx.status === "LIVE" && (
                                    <button
                                      onClick={() => deleteSpecificGoal(fx.id, g.id, "away")}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 ml-0.5 transition-opacity cursor-pointer"
                                      title="Delete goal"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {/* Cards */}
                              {awayCards.map((c) => (
                                <div
                                  key={c.id}
                                  title={c.reason ?? "Disciplinary card"}
                                  className={`group relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-2xs border ${
                                    c.cardType === "YELLOW"
                                      ? "bg-amber-50/90 border-amber-300 text-amber-900"
                                      : "bg-rose-50/90 border-rose-300 text-rose-900"
                                  }`}
                                >
                                  <CardIcon type={c.cardType} />
                                  <span className="font-bold">{c.playerName}</span>
                                  <span className="text-[9.5px] font-bold opacity-75">{c.minute}&apos;</span>
                                  {fx.status === "LIVE" && (
                                    <button
                                      onClick={() => deleteSpecificCard(fx.id, c.id)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 ml-0.5 transition-opacity cursor-pointer"
                                      title="Delete card"
                                    >
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Schedule New Match Form */}
        <form onSubmit={handleScheduleFixture} className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Schedule New Match</h3>
            <span className="px-2 py-0.5 bg-[#FFF9E6] border border-[#FFB800]/40 text-[#7C5800] text-[10px] font-bold font-montserrat uppercase rounded-xs">
              Operations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Home Club
              </label>
              <div className="relative">
                <select
                  value={homeClubId}
                  onChange={(e) => setHomeClubId(e.target.value)}
                  className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Away Club
              </label>
              <div className="relative">
                <select
                  value={awayClubId}
                  onChange={(e) => setAwayClubId(e.target.value)}
                  className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Match Date
              </label>
              <input
                type="date"
                value={kickoffDate}
                onChange={(e) => setKickoffDate(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Kick-off Time
              </label>
              <input
                type="time"
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Riverside Park"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
                Pitch
              </label>
              <input
                type="text"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="e.g. Pitch 1"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
              Assign Referee
            </label>
            <div className="relative">
              <select
                value={refereeId}
                onChange={(e) => setRefereeId(e.target.value)}
                className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
              >
                <option value="">Select referee (optional)</option>
                {staffDirectory
                  .filter((s) => s.role === "REFEREE")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-1.5">
              Assign Commissioner
            </label>
            <div className="relative">
              <select
                value={commissionerId}
                onChange={(e) => setCommissionerId(e.target.value)}
                className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
              >
                <option value="">Select commissioner (optional)</option>
                {staffDirectory
                  .filter((s) => s.role === "COMMISSIONER")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 border border-[#1A1C1C]"
          >
            <Plus size={14} className="text-[#FFB800]" />
            <span>Schedule Fixture</span>
          </button>

          <p className="text-[10px] text-slate-400 font-semibold text-center">
            {clubs.length} clubs available in Season 2025/26
          </p>
        </form>
      </div>

      {/* Match Event Modal Dialog (Goals & Cards) */}
      {eventModal && eventModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1C1C] text-[#FFB800] flex items-center justify-center text-sm font-black">
                  {eventType === "GOAL" ? <GoalIcon className="w-4 h-4 text-[#FFB800]" /> : <CardIcon type={eventType} className="w-3 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">
                    Log Match Event · {activeClubForModal?.name ?? "Club"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Record live goal or disciplinary card</p>
                </div>
              </div>
              <button
                onClick={() => setEventModal(null)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="p-5 space-y-4">
              {/* Event Type Toggle */}
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Event Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType("GOAL")}
                    className={`py-2 rounded-md text-xs font-bold font-montserrat uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      eventType === "GOAL"
                        ? "bg-[#1A1C1C] text-[#FFB800] border-[#1A1C1C]"
                        : "bg-[#F8F9FA] border-[#E5E7EB] text-slate-600 hover:bg-white"
                    }`}
                  >
                    <GoalIcon className="w-3.5 h-3.5" /> Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType("YELLOW")}
                    className={`py-2 rounded-md text-xs font-bold font-montserrat uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      eventType === "YELLOW"
                        ? "bg-amber-500 text-black border-amber-500 font-extrabold"
                        : "bg-[#F8F9FA] border-[#E5E7EB] text-slate-600 hover:bg-white"
                    }`}
                  >
                    <CardIcon type="YELLOW" /> Yellow Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType("RED")}
                    className={`py-2 rounded-md text-xs font-bold font-montserrat uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      eventType === "RED"
                        ? "bg-rose-600 text-white border-rose-600 font-extrabold"
                        : "bg-[#F8F9FA] border-[#E5E7EB] text-slate-600 hover:bg-white"
                    }`}
                  >
                    <CardIcon type="RED" /> Red Card
                  </button>
                </div>
              </div>

              {/* Player Selection */}
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  {eventType === "GOAL" ? "Goal Scorer" : "Player Sanctioned"}
                </label>
                {activeClubPlayers.length > 0 ? (
                  <div className="relative">
                    <select
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      {activeClubPlayers.map((p) => (
                        <option key={p.id} value={p.fullName}>
                          #{p.jerseyNumber} · {p.fullName} ({p.position})
                        </option>
                      ))}
                      <option value="custom">— Enter custom player name —</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    required
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                )}
                {playerName === "custom" && (
                  <input
                    type="text"
                    placeholder="Type player full name..."
                    onChange={(e) => setPlayerName(e.target.value)}
                    autoFocus
                    required
                    className="mt-2 w-full bg-[#F8F9FA] border border-[#FFB800] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] focus:outline-none"
                  />
                )}
              </div>

              {/* Minute and Event Specific Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Match Minute
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={130}
                      value={eventMinute}
                      onChange={(e) => setEventMinute(Number(e.target.value))}
                      required
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">&apos;</span>
                  </div>
                </div>

                {eventType === "GOAL" ? (
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                      Goal Type
                    </label>
                    <div className="relative">
                      <select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value as "REGULAR" | "PENALTY" | "OWN_GOAL")}
                        className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                      >
                        <option value="REGULAR">Regular Goal</option>
                        <option value="PENALTY">Penalty (P)</option>
                        <option value="OWN_GOAL">Own Goal (OG)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                      Card Infraction
                    </label>
                    <div className="relative">
                      <select
                        value={cardReason}
                        onChange={(e) => setCardReason(e.target.value)}
                        className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                      >
                        {CARD_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Assist (Only for goals) */}
              {eventType === "GOAL" && (
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Assist Provider <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={assistName}
                    onChange={(e) => setAssistName(e.target.value)}
                    placeholder="e.g. Dele Osei"
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-medium text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setEventModal(null)}
                  className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Confirm Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Fixture Modal */}
      {editingFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div>
                <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Edit Fixture Details</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {getClub(editingFixture.homeClubId)?.name} vs {getClub(editingFixture.awayClubId)?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingFixture(null)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditFixture} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    value={editingFixture.kickoff.split("T")[0]}
                    onChange={(e) => {
                      const time = editingFixture.kickoff.split("T")[1] ?? "15:00:00Z";
                      setEditingFixture({ ...editingFixture, kickoff: `${e.target.value}T${time}` });
                    }}
                    required
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Match Status
                  </label>
                  <div className="relative">
                    <select
                      value={editingFixture.status}
                      onChange={(e) => setEditingFixture({ ...editingFixture, status: e.target.value as FixtureStatus })}
                      className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="LIVE">Live</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="POSTPONED">Postponed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={editingFixture.venue}
                    onChange={(e) => setEditingFixture({ ...editingFixture, venue: e.target.value })}
                    required
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Pitch
                  </label>
                  <input
                    type="text"
                    value={editingFixture.pitch}
                    onChange={(e) => setEditingFixture({ ...editingFixture, pitch: e.target.value })}
                    required
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Assign Referee
                  </label>
                  <div className="relative">
                    <select
                      value={editingFixture.refereeId ?? ""}
                      onChange={(e) => setEditingFixture({ ...editingFixture, refereeId: e.target.value || null })}
                      className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {staffDirectory
                        .filter((s) => s.role === "REFEREE")
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Assign Commissioner
                  </label>
                  <div className="relative">
                    <select
                      value={editingFixture.commissionerId ?? ""}
                      onChange={(e) => setEditingFixture({ ...editingFixture, commissionerId: e.target.value || null })}
                      className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {staffDirectory
                        .filter((s) => s.role === "COMMISSIONER")
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setEditingFixture(null)}
                  className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
