"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Users,
  Shield,
  Edit3,
  Trash2,
  X,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { clubs as initialClubs, players, staffDirectory } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { Club, RegistrationFeeStatus, MatchStaff } from "@/lib/types";

const FEE_TONE: Record<RegistrationFeeStatus, "success" | "warning" | "danger"> = {
  PAID: "success",
  PENDING: "warning",
  OVERDUE: "danger",
};

export default function TeamsPage() {
  const [clubsList, setClubsList] = useState<Club[]>(initialClubs);
  const [query, setQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "VERIFIED" | "IN_REVIEW" | "OVERDUE">("ALL");
  const [selectedId, setSelectedId] = useState(initialClubs[0]?.id ?? "");
  const [activeDetailTab, setActiveDetailTab] = useState<"OVERVIEW" | "SQUAD">("OVERVIEW");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // New Club Form State
  const [newClubName, setNewClubName] = useState("");
  const [newClubCode, setNewClubCode] = useState("");
  const [newRegion, setNewRegion] = useState("London North");
  const [newAgeGroup, setNewAgeGroup] = useState("U19");
  const [newCity, setNewCity] = useState("London");
  const [newFounded, setNewFounded] = useState("2020");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerRole, setNewManagerRole] = useState("Head Coach");
  const [newManagerPhone, setNewManagerPhone] = useState("");
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("450");
  const [newFeeStatus, setNewFeeStatus] = useState<RegistrationFeeStatus>("PENDING");

  // Filtered clubs
  const filtered = useMemo(() => {
    return clubsList.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.region.toLowerCase().includes(query.toLowerCase()) ||
        c.manager.fullName.toLowerCase().includes(query.toLowerCase());

      const matchesTab =
        filterTab === "ALL" ||
        (filterTab === "VERIFIED" && c.verified) ||
        (filterTab === "IN_REVIEW" && !c.verified) ||
        (filterTab === "OVERDUE" && c.registrationFeeStatus === "OVERDUE");

      return matchesQuery && matchesTab;
    });
  }, [clubsList, query, filterTab]);

  const selected = clubsList.find((c) => c.id === selectedId) ?? filtered[0] ?? clubsList[0];

  // Players belonging to the selected club
  const clubSquad = useMemo(() => {
    if (!selected) return [];
    return players.filter((p) => p.teamId === selected.id || p.teamName === selected.name);
  }, [selected]);

  // Actions
  function toggleVerification(clubId: string) {
    setClubsList((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        const nextVerified = !c.verified;
        toast.success(nextVerified ? `${c.name} has been verified!` : `${c.name} marked as In Review.`);
        return { ...c, verified: nextVerified };
      })
    );
  }

  function handleDeleteClub(clubId: string) {
    const clubToDelete = clubsList.find((c) => c.id === clubId);
    if (!clubToDelete) return;
    setClubsList((prev) => prev.filter((c) => c.id !== clubId));
    toast.success(`${clubToDelete.name} has been removed.`);
    if (selectedId === clubId) {
      const remaining = clubsList.filter((c) => c.id !== clubId);
      if (remaining.length > 0) setSelectedId(remaining[0].id);
    }
  }

  function handleCreateClub(e: React.FormEvent) {
    e.preventDefault();
    if (!newClubName.trim() || !newManagerName.trim()) {
      toast.error("Please fill in required club and manager details.");
      return;
    }

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: newClubName.trim(),
      code: (newClubCode.trim() || newClubName.slice(0, 2)).toUpperCase(),
      region: newRegion.trim(),
      ageGroup: newAgeGroup.trim(),
      cityOrTown: newCity.trim(),
      logoUrl: null,
      registrationFeePaid: newFeeStatus === "PAID",
      registrationFeeStatus: newFeeStatus,
      registrationFeeAmount: Number(newFeeAmount) || 450,
      registrationFeeDate: newFeeStatus === "PAID" ? new Date().toISOString().split("T")[0] : null,
      playerCount: 0,
      avgAge: 18.5,
      founded: Number(newFounded) || 2024,
      manager: {
        id: `mgr-${Date.now()}`,
        fullName: newManagerName.trim(),
        role: newManagerRole.trim(),
        email: newManagerEmail.trim() || null,
        contactNumber: newManagerPhone.trim() || "+44 7700 900000",
      },
      assignedStaff: [],
      verified: false,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setClubsList((prev) => [newClub, ...prev]);
    setSelectedId(newClub.id);
    setIsAddModalOpen(false);
    toast.success(`Club "${newClub.name}" added to directory!`);

    // Reset Form
    setNewClubName("");
    setNewClubCode("");
    setNewManagerName("");
    setNewManagerPhone("");
    setNewManagerEmail("");
  }

  function handleUpdateFee(e: React.FormEvent, status: RegistrationFeeStatus, amount: number, date: string) {
    e.preventDefault();
    if (!selected) return;
    setClubsList((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              registrationFeeStatus: status,
              registrationFeePaid: status === "PAID",
              registrationFeeAmount: amount,
              registrationFeeDate: status === "PAID" ? date || new Date().toISOString().split("T")[0] : null,
            }
          : c
      )
    );
    setIsFeeModalOpen(false);
    toast.success(`Registration fee status updated for ${selected.name}`);
  }

  function handleToggleStaffAssignment(staff: MatchStaff) {
    if (!selected) return;
    const isAssigned = selected.assignedStaff.some((s) => s.id === staff.id);
    const updatedStaff = isAssigned
      ? selected.assignedStaff.filter((s) => s.id !== staff.id)
      : [...selected.assignedStaff, staff];

    setClubsList((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, assignedStaff: updatedStaff } : c))
    );
    toast.success(isAssigned ? `Removed ${staff.fullName}` : `Assigned ${staff.fullName} to ${selected.name}`);
  }

  const overdueCount = clubsList.filter((c) => c.registrationFeeStatus === "OVERDUE").length;

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader
        eyebrow="Club Directory"
        title="Teams & Clubs"
        subtitle={`${clubsList.length} clubs enrolled · Season 2025/26`}
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1A1C1C]"
          >
            <Plus size={16} className="text-[#FFB800]" />
            <span>Add Club</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-md border border-[#E5E7EB] shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search clubs, manager or region..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-semibold text-[#1A1C1C] placeholder:text-slate-400 focus:outline-none focus:border-[#FFB800] focus:bg-white"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "ALL", label: "All Clubs", count: clubsList.length },
              { id: "VERIFIED", label: "Verified", count: clubsList.filter((c) => c.verified).length },
              { id: "IN_REVIEW", label: "In Review", count: clubsList.filter((c) => !c.verified).length },
              { id: "OVERDUE", label: "Fee Overdue", count: overdueCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer whitespace-nowrap ${
                filterTab === t.id
                  ? t.id === "OVERDUE"
                    ? "bg-rose-600 text-white"
                    : "bg-[#1A1C1C] text-[#FFB800]"
                  : "text-slate-500 hover:bg-[#F8F9FA] hover:text-black border border-transparent"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start min-w-0">
        {/* Main Clubs Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs overflow-hidden min-w-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
                  {["Club", "Head Coach", "Squad", "Reg. Fee", "Match Staff", "Status", ""].map((h) => (
                    <th key={h} className="px-3.5 py-3 text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 space-y-1">
                      <Shield size={28} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold font-montserrat uppercase text-slate-500">No clubs found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search query or status filter.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((club) => (
                    <tr
                      key={club.id}
                      onClick={() => setSelectedId(club.id)}
                      className={`border-b border-[#E5E7EB] last:border-b-0 cursor-pointer transition-colors ${
                        selected?.id === club.id ? "bg-[#FFF9E6]" : "hover:bg-[#F8F9FA]"
                      }`}
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={club.name} size="sm" tone={selected?.id === club.id ? "gold" : "ink"} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold font-montserrat text-[#1A1C1C] whitespace-nowrap">{club.name}</p>
                            <p className="text-[10.5px] text-slate-400 font-semibold whitespace-nowrap">
                              {club.region} · {club.ageGroup}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="text-xs font-semibold text-[#1A1C1C] whitespace-nowrap">{club.manager.fullName}</span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="text-xs font-black font-montserrat text-[#1A1C1C]">{club.playerCount}</span>
                      </td>
                      <td className="px-3.5 py-3">
                        <StatusPill
                          label={club.registrationFeeStatus.charAt(0) + club.registrationFeeStatus.slice(1).toLowerCase()}
                          tone={FEE_TONE[club.registrationFeeStatus]}
                        />
                      </td>
                      <td className="px-3.5 py-3">
                        {club.assignedStaff.length ? (
                          <div className="flex flex-wrap gap-1 items-center">
                            {club.assignedStaff.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full pl-1 pr-2 py-0.5 text-[10px] font-bold text-slate-600 whitespace-nowrap"
                              >
                                <Avatar name={s.fullName} size="xs" tone="muted" />
                                {s.role === "REFEREE" ? "Ref" : "Comm."}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        <StatusPill label={club.verified ? "Verified" : "In Review"} tone={club.verified ? "info" : "neutral"} />
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <ChevronRight size={16} className={selected?.id === club.id ? "text-[#7C5800]" : "text-slate-300"} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Club Detail Panel */}
        {selected && (
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-5 space-y-5 min-w-0">
            {/* Header & Quick Action Buttons */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded p-0.5">
                <button
                  onClick={() => setActiveDetailTab("OVERVIEW")}
                  className={`px-2.5 py-1 text-[10.5px] font-bold font-montserrat uppercase rounded cursor-pointer transition-colors ${
                    activeDetailTab === "OVERVIEW" ? "bg-[#1A1C1C] text-[#FFB800]" : "text-slate-500 hover:text-black"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveDetailTab("SQUAD")}
                  className={`px-2.5 py-1 text-[10.5px] font-bold font-montserrat uppercase rounded cursor-pointer transition-colors ${
                    activeDetailTab === "SQUAD" ? "bg-[#1A1C1C] text-[#FFB800]" : "text-slate-500 hover:text-black"
                  }`}
                >
                  Squad ({clubSquad.length})
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 rounded text-slate-400 hover:text-black hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  title="Edit Club"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteClub(selected.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Club"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {activeDetailTab === "OVERVIEW" ? (
              <>
                {/* Brand & KPI Overview */}
                <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-[#E5E7EB]">
                  <Avatar name={selected.name} size="lg" tone="ink" />
                  <div>
                    <p className="text-base font-black font-montserrat uppercase text-[#1A1C1C]">{selected.name}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {selected.region} · Founded {selected.founded}
                    </p>
                  </div>

                  {/* Verification Control */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => toggleVerification(selected.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer border ${
                        selected.verified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      }`}
                      title="Click to toggle verification status"
                    >
                      {selected.verified ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      <span>{selected.verified ? "Verified Club" : "In Review — Click to Verify"}</span>
                    </button>
                  </div>

                  <div className="flex w-full justify-between pt-3">
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

                {/* Head Coach / Manager */}
                <div>
                  <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400 mb-2">Head Coach / Manager</p>
                  <div className="flex items-center gap-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3">
                    <Avatar name={selected.manager.fullName} size="md" tone="muted" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{selected.manager.fullName}</p>
                      <p className="text-[10.5px] text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-slate-400 shrink-0" /> {selected.manager.contactNumber}
                      </p>
                      {selected.manager.email && (
                        <p className="text-[10.5px] text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-slate-400 shrink-0" /> {selected.manager.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Fee */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Registration Fee</p>
                    <button
                      onClick={() => setIsFeeModalOpen(true)}
                      className="text-[10.5px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase cursor-pointer"
                    >
                      Update Fee
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3">
                    <div>
                      <p className="text-sm font-black font-montserrat text-[#1A1C1C]">£{selected.registrationFeeAmount.toFixed(2)}</p>
                      <p className="text-[10.5px] text-slate-400 font-semibold">
                        {selected.registrationFeeDate ? `Paid on ${formatDate(selected.registrationFeeDate)}` : "Not yet paid"}
                      </p>
                    </div>
                    <StatusPill
                      label={selected.registrationFeeStatus.charAt(0) + selected.registrationFeeStatus.slice(1).toLowerCase()}
                      tone={FEE_TONE[selected.registrationFeeStatus]}
                    />
                  </div>
                </div>

                {/* Match Staff Assigned */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">Assigned Match Staff</p>
                    <button
                      onClick={() => setIsStaffModalOpen(true)}
                      className="text-[10.5px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase cursor-pointer"
                    >
                      Manage Staff
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selected.assignedStaff.length === 0 ? (
                      <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-center">
                        <p className="text-xs text-slate-400 font-semibold">No match staff assigned yet.</p>
                      </div>
                    ) : (
                      selected.assignedStaff.map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.fullName} size="sm" tone="muted" />
                            <div>
                              <p className="text-xs font-bold font-montserrat text-[#1A1C1C]">{s.fullName}</p>
                              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">
                                {s.role === "REFEREE" ? "Referee" : "Commissioner"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleStaffAssignment(s)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="Remove staff assignment"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Squad Roster Tab */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">
                    Registered Players ({clubSquad.length})
                  </p>
                  <Link href="/players" className="text-[10.5px] font-bold font-montserrat text-[#7C5800] hover:text-black uppercase">
                    Scout View →
                  </Link>
                </div>

                {clubSquad.length === 0 ? (
                  <div className="p-6 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-center text-slate-400 space-y-1">
                    <Users size={20} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">No players assigned yet</p>
                    <p className="text-[10.5px]">Players registering with {selected.name} will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                    {clubSquad.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md hover:border-[#FFB800] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded bg-[#1A1C1C] text-[#FFB800] text-[10px] font-black flex items-center justify-center shrink-0">
                            #{p.jerseyNumber}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">{p.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{p.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10.5px] font-black font-montserrat text-[#7C5800] bg-[#FFF9E6] px-1.5 py-0.5 rounded">
                            {p.scoutGrade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Club Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <Building2 size={20} className="text-[#FFB800]" />
                <div>
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Register New Club</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Add club franchise to League Season 2025/26</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Club Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Northside United"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Crest Code
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. NU"
                    value={newClubCode}
                    onChange={(e) => setNewClubCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-bold text-[#1A1C1C] uppercase focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Region
                  </label>
                  <input
                    type="text"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Division
                  </label>
                  <select
                    value={newAgeGroup}
                    onChange={(e) => setNewAgeGroup(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                  >
                    <option value="Premier Division">Premier Division</option>
                    <option value="Championship">Championship</option>
                    <option value="U19">U19 League</option>
                    <option value="U18">U18 League</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Founded
                  </label>
                  <input
                    type="number"
                    value={newFounded}
                    onChange={(e) => setNewFounded(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
                <p className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Head Coach / Manager</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Sterling"
                      value={newManagerName}
                      onChange={(e) => setNewManagerName(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      placeholder="+44 7700 900000"
                      value={newManagerPhone}
                      onChange={(e) => setNewManagerPhone(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="coach@club.com"
                    value={newManagerEmail}
                    onChange={(e) => setNewManagerEmail(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] space-y-3">
                <p className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Registration Fee Setup</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                      Fee Amount (£)
                    </label>
                    <input
                      type="number"
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={newFeeStatus}
                      onChange={(e) => setNewFeeStatus(e.target.value as RegistrationFeeStatus)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} className="text-[#FFB800]" />
                  <span>Create Club</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {isEditModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div>
                <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Edit Club Details</h3>
                <p className="text-[11px] text-slate-500 font-medium">{selected.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditModalOpen(false);
                toast.success(`Updated club details for ${selected.name}`);
              }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) =>
                      setClubsList((prev) =>
                        prev.map((c) => (c.id === selected.id ? { ...c, name: e.target.value } : c))
                      )
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Region
                  </label>
                  <input
                    type="text"
                    value={selected.region}
                    onChange={(e) =>
                      setClubsList((prev) =>
                        prev.map((c) => (c.id === selected.id ? { ...c, region: e.target.value } : c))
                      )
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    value={selected.manager.fullName}
                    onChange={(e) =>
                      setClubsList((prev) =>
                        prev.map((c) =>
                          c.id === selected.id ? { ...c, manager: { ...c.manager, fullName: e.target.value } } : c
                        )
                      )
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                    Manager Phone
                  </label>
                  <input
                    type="text"
                    value={selected.manager.contactNumber}
                    onChange={(e) =>
                      setClubsList((prev) =>
                        prev.map((c) =>
                          c.id === selected.id ? { ...c, manager: { ...c.manager, contactNumber: e.target.value } } : c
                        )
                      )
                    }
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

      {/* Update Fee Modal */}
      {isFeeModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <CreditCard size={20} className="text-[#FFB800]" />
                <div>
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Update Registration Fee</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selected.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                const form = e.currentTarget;
                const status = (form.elements.namedItem("status") as HTMLSelectElement).value as RegistrationFeeStatus;
                const amount = Number((form.elements.namedItem("amount") as HTMLInputElement).value);
                const date = (form.elements.namedItem("date") as HTMLInputElement).value;
                handleUpdateFee(e, status, amount, date);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Fee Status
                </label>
                <select
                  name="status"
                  defaultValue={selected.registrationFeeStatus}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Amount (£)
                </label>
                <input
                  type="number"
                  name="amount"
                  defaultValue={selected.registrationFeeAmount}
                  required
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                  Payment Date (if paid)
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selected.registrationFeeDate ?? new Date().toISOString().split("T")[0]}
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer"
                >
                  Confirm Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Staff Assignment Modal */}
      {isStaffModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-2.5">
                <Users size={20} className="text-[#FFB800]" />
                <div>
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Assign Match Staff</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selected.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-slate-500 font-medium">
                Toggle staff members to assign or unassign them from overseeing matches for this club.
              </p>

              <div className="space-y-2 pt-2">
                {staffDirectory.map((staff) => {
                  const isAssigned = selected.assignedStaff.some((s) => s.id === staff.id);
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleToggleStaffAssignment(staff)}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        isAssigned
                          ? "bg-[#FFF9E6] border-[#FFB800] text-[#1A1C1C]"
                          : "bg-[#F8F9FA] border-[#E5E7EB] text-slate-600 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={staff.fullName} size="sm" tone={isAssigned ? "gold" : "muted"} />
                        <div>
                          <p className="text-xs font-bold font-montserrat text-[#1A1C1C]">{staff.fullName}</p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {staff.role === "REFEREE" ? "League Referee" : "Match Commissioner"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold font-montserrat uppercase px-2 py-0.5 rounded ${
                          isAssigned ? "bg-[#1A1C1C] text-[#FFB800]" : "bg-white border border-[#E5E7EB] text-slate-400"
                        }`}
                      >
                        {isAssigned ? "Assigned" : "Assign"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F8F9FA] flex justify-end">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
