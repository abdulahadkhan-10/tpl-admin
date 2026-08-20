import Link from "next/link";
import { Shield, Users, Clock, CalendarDays, Trophy, ArrowRight, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import StatusPill from "@/components/ui/StatusPill";
import Avatar from "@/components/ui/Avatar";
import { fixtures, leagueStats, players, getClub, getStaff } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const liveFixtures = fixtures.filter((f) => f.status === "LIVE");

  const registrationFeed = [
    { id: "reg-1", kind: "Player" as const, name: players[0].fullName, club: players[0].teamName!, at: "2026-08-20T12:30:00Z", verified: true },
    { id: "reg-2", kind: "Club" as const, name: "Northside Athletic", club: "New registration", at: "2026-08-20T11:00:00Z", verified: false },
    { id: "reg-3", kind: "Player" as const, name: players[3].fullName, club: players[3].teamName!, at: "2026-08-20T10:10:00Z", verified: true },
    { id: "reg-4", kind: "Player" as const, name: players[1].fullName, club: players[1].teamName!, at: "2026-08-20T09:05:00Z", verified: false },
    { id: "reg-5", kind: "Club" as const, name: "Meadowlane FC", club: "Registration fee paid", at: "2026-08-20T07:00:00Z", verified: true },
  ];

  const topScouted = [...players].sort((a, b) => (b.scoutGrade ?? 0) - (a.scoutGrade ?? 0)).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Operations Overview"
        title="Operations Dashboard"
        subtitle={`Matchday 14 · Premier Division${liveFixtures.length ? ` · ${liveFixtures.length} live now` : ""}`}
        action={
          <Link
            href="/fixtures"
            className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-white text-xs font-bold font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1A1C1C]"
          >
            <Plus size={16} className="text-[#FFB800]" />
            <span>New Fixture</span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Active Clubs" value={leagueStats.activeClubs} icon={Shield} tone="gold" trend={leagueStats.activeClubsTrend} />
        <StatCard label="Registered Players" value={leagueStats.registeredPlayers.toLocaleString()} icon={Users} tone="ink" trend={leagueStats.registeredPlayersTrend} />
        <StatCard label="Pending Registrations" value={leagueStats.pendingRegistrations} icon={Clock} tone="warning" trend="Needs review" />
        <StatCard label="Matches This Week" value={leagueStats.matchesThisWeek} icon={CalendarDays} tone="success" trend="On schedule" />
        <StatCard label="Prize Pool" value={`£${leagueStats.prizePool.toLocaleString()}`} icon={Trophy} tone="gold" trend="Fully funded" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Live Matchday</h2>
              <Link href="/fixtures" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
                View all fixtures <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fixtures.filter((f) => f.status !== "FULL_TIME").map((fx) => {
                const home = getClub(fx.homeClubId)!;
                const away = getClub(fx.awayClubId)!;
                const referee = getStaff(fx.refereeId);
                return (
                  <div key={fx.id} className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-4 flex flex-col gap-3">
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
                        <Avatar name={home.name} size="sm" tone="ink" />
                        <span className="text-[11px] font-bold font-montserrat text-[#1A1C1C] text-center">{home.name}</span>
                      </div>
                      <span className="text-xl font-black font-montserrat text-[#1A1C1C] px-2">
                        {fx.status === "LIVE" ? `${fx.homeScore} – ${fx.awayScore}` : "VS"}
                      </span>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <Avatar name={away.name} size="sm" tone="muted" />
                        <span className="text-[11px] font-bold font-montserrat text-[#1A1C1C] text-center">{away.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-400 border-t border-[#E5E7EB] pt-2.5">
                      <span>{fx.pitch}</span>
                      <span>{referee ? `Ref: ${referee.fullName}` : "Referee TBC"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Top Scout-Rated Players</h2>
              <Link href="/players" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
                Open scouting <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {topScouted.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-black font-montserrat text-slate-300">0{i + 1}</span>
                  <span className="w-36 shrink-0 text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{p.fullName}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#7C5800]" style={{ width: `${p.scoutGrade}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-black font-montserrat text-[#1A1C1C]">{p.scoutGrade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Recent Registrations</h2>
            <Link href="/teams" className="text-[11.5px] font-extrabold font-montserrat text-[#7C5800] hover:text-[#1A1C1C] flex items-center gap-1">
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div>
            {registrationFeed.map((reg) => (
              <div key={reg.id} className="flex items-center gap-3 py-2.5 border-b border-[#E5E7EB] last:border-b-0 last:pb-0">
                <Avatar name={reg.name} size="sm" tone={reg.kind === "Club" ? "muted" : "ink"} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{reg.name}</p>
                  <p className="text-[10.5px] text-slate-400 font-semibold truncate">
                    {reg.kind} · {reg.club} · {timeAgo(reg.at)}
                  </p>
                </div>
                <StatusPill label={reg.verified ? "Verified" : "Pending"} tone={reg.verified ? "success" : "warning"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
