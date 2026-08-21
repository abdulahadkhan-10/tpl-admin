"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Clock,
  CalendarDays,
  Trophy,
  ArrowRight,
  Plus,
  CheckCircle2,
  Activity,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusPill from "@/components/ui/StatusPill";
import Avatar from "@/components/ui/Avatar";
import { fixtures, leagueStats, players, getClub, getStaff } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";

interface RegistrationFeedItem {
  id: string;
  kind: "Player" | "Club";
  name: string;
  club: string;
  at: string;
  verified: boolean;
}

const initialRegistrationFeed: RegistrationFeedItem[] = [
  { id: "reg-1", kind: "Player", name: players[0]?.fullName ?? "Marcus Reid", club: players[0]?.teamName ?? "Riverside FC", at: "2026-08-20T12:30:00Z", verified: true },
  { id: "reg-2", kind: "Club", name: "Northside Athletic", club: "New franchise application", at: "2026-08-20T11:00:00Z", verified: false },
  { id: "reg-3", kind: "Player", name: players[3]?.fullName ?? "Kofi Mensah", club: players[3]?.teamName ?? "Oldbridge FC", at: "2026-08-20T10:10:00Z", verified: true },
  { id: "reg-4", kind: "Player", name: players[1]?.fullName ?? "Dele Osei", club: players[1]?.teamName ?? "Ashford Town", at: "2026-08-20T09:05:00Z", verified: false },
  { id: "reg-5", kind: "Club", name: "Meadowlane FC", club: "Registration fee paid", at: "2026-08-20T07:00:00Z", verified: true },
];

export default function DashboardPage() {
  const [feed, setFeed] = useState<RegistrationFeedItem[]>(initialRegistrationFeed);

  const liveFixtures = fixtures.filter((f) => f.status === "LIVE");
  const topScouted = [...players].sort((a, b) => (b.scoutGrade ?? 0) - (a.scoutGrade ?? 0)).slice(0, 4);

  function verifyRegistration(id: string) {
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        toast.success(`${item.name} (${item.kind}) verified!`);
        return { ...item, verified: true };
      })
    );
  }

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader
        eyebrow="Operations Overview"
        title="Operations Dashboard"
        subtitle={`Matchday 14 · Premier Division${liveFixtures.length ? ` · ${liveFixtures.length} live now` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/fixtures"
              className="px-4 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1A1C1C]"
            >
              <Plus size={15} className="text-[#FFB800]" />
              <span>Schedule Match</span>
            </Link>
          </div>
        }
      />

      {/* Actionable KPI Metric Cards with Deep Links */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/teams" className="block transition-transform hover:-translate-y-0.5">
          <StatCard label="Active Clubs" value={leagueStats.activeClubs} icon={Shield} tone="gold" trend={leagueStats.activeClubsTrend} />
        </Link>
        <Link href="/players" className="block transition-transform hover:-translate-y-0.5">
          <StatCard label="Registered Players" value={leagueStats.registeredPlayers.toLocaleString()} icon={Users} tone="ink" trend={leagueStats.registeredPlayersTrend} />
        </Link>
        <Link href="/teams" className="block transition-transform hover:-translate-y-0.5">
          <StatCard label="Pending Registrations" value={leagueStats.pendingRegistrations} icon={Clock} tone="warning" trend="Needs review" />
        </Link>
        <Link href="/fixtures" className="block transition-transform hover:-translate-y-0.5">
          <StatCard label="Matches This Week" value={leagueStats.matchesThisWeek} icon={CalendarDays} tone="success" trend="On schedule" />
        </Link>
        <Link href="/standings" className="block transition-transform hover:-translate-y-0.5">
          <StatCard label="Prize Pool" value={`£${leagueStats.prizePool.toLocaleString()}`} icon={Trophy} tone="gold" trend="Fully funded" />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start min-w-0">
        <div className="xl:col-span-2 space-y-6 min-w-0">
          {/* Live Matchday Overview with Jump Links */}
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#FFB800]" />
                <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Live Matchday Hub</h2>
              </div>
              <Link href="/fixtures" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
                View all fixtures <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fixtures.filter((f) => f.status !== "FULL_TIME").map((fx) => {
                const home = getClub(fx.homeClubId);
                const away = getClub(fx.awayClubId);
                const referee = getStaff(fx.refereeId);
                return (
                  <Link
                    key={fx.id}
                    href="/fixtures"
                    className="bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#FFB800] rounded-md p-4 flex flex-col gap-3 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      {fx.status === "LIVE" ? (
                        <StatusPill label={`LIVE ${fx.minute}'`} tone="danger" pulse />
                      ) : (
                        <StatusPill label="Scheduled" tone="info" dot={false} />
                      )}
                      <span className="text-[10.5px] font-bold text-slate-400">{fx.venue}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Avatar name={home?.name ?? "Club"} size="sm" tone="ink" />
                        <span className="text-[11px] font-bold font-montserrat text-[#1A1C1C] text-center">{home?.name ?? "Club"}</span>
                      </div>
                      <span className="text-xl font-black font-montserrat text-[#1A1C1C] px-2 group-hover:text-[#7C5800] transition-colors">
                        {fx.status === "LIVE" ? `${fx.homeScore} – ${fx.awayScore}` : "VS"}
                      </span>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Avatar name={away?.name ?? "Club"} size="sm" tone="muted" />
                        <span className="text-[11px] font-bold font-montserrat text-[#1A1C1C] text-center">{away?.name ?? "Club"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-400 border-t border-[#E5E7EB] pt-2.5">
                      <span>{fx.pitch}</span>
                      <span>{referee ? `Ref: ${referee.fullName}` : "Referee TBC"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top Scout-Rated Prospects with Deep Links */}
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#FFB800]" />
                <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Top Scout-Rated Prospects</h2>
              </div>
              <Link href="/players" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
                Open scouting <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {topScouted.map((p, i) => (
                <Link
                  key={p.id}
                  href="/players"
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-[#F8F9FA] transition-colors group cursor-pointer"
                >
                  <span className="w-6 text-xs font-black font-montserrat text-slate-300 group-hover:text-[#7C5800]">0{i + 1}</span>
                  <div className="w-40 shrink-0 min-w-0">
                    <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{p.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">{p.position} · {p.teamName}</p>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#7C5800]" style={{ width: `${p.scoutGrade}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-black font-montserrat text-[#1A1C1C] bg-[#FFF9E6] px-1.5 py-0.5 rounded">
                    {p.scoutGrade}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Registrations with Quick Verify Controls */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 min-w-0">
          <div className="flex items-center justify-between mb-3 border-b border-[#E5E7EB] pb-3">
            <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Recent Registrations</h2>
            <Link href="/teams" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
              See all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {feed.map((reg) => (
              <div key={reg.id} className="flex items-center gap-3 py-3 last:pb-0">
                <Avatar name={reg.name} size="sm" tone={reg.kind === "Club" ? "muted" : "ink"} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{reg.name}</p>
                  <p className="text-[10.5px] text-slate-400 font-semibold truncate">
                    {reg.kind} · {reg.club} · {timeAgo(reg.at)}
                  </p>
                </div>
                {reg.verified ? (
                  <StatusPill label="Verified" tone="success" />
                ) : (
                  <button
                    onClick={() => verifyRegistration(reg.id)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-emerald-600 text-amber-800 hover:text-white border border-amber-300 hover:border-emerald-600 rounded text-[10px] font-bold font-montserrat uppercase transition-colors cursor-pointer flex items-center gap-1"
                    title="Click to approve and verify registration"
                  >
                    <CheckCircle2 size={11} />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
