"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  ChevronDown,
  ShieldAlert,
  Users,
  Tag,
  X,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { supportTickets as initialTickets, staffDirectory } from "@/lib/mockData";
import { formatTime, timeAgo } from "@/lib/utils";
import type { SupportTicket, TicketStatus, TicketCategory } from "@/lib/types";

const STATUS_FILTERS: { id: "ALL" | TicketStatus | "URGENT"; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "URGENT", label: "Urgent" },
  { id: "RESOLVED", label: "Resolved" },
];

const CATEGORIES: { id: "ALL" | TicketCategory; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "MATCH_SCHEDULE", label: "Match Schedule" },
  { id: "REGISTRATION", label: "Registration & Fees" },
  { id: "EQUIPMENT", label: "Equipment & Kits" },
  { id: "DISPUTE", label: "Disputes & Incidents" },
  { id: "MEDICAL", label: "Medical / Injury" },
  { id: "OTHERS", label: "General" },
];

const STATUS_TONE: Record<TicketStatus, "warning" | "info" | "success"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TicketStatus | "URGENT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | TicketCategory>("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTickets[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [assignedStaffMap, setAssignedStaffMap] = useState<Record<string, string>>({
    "tk-1": "Michael Osei",
    "tk-2": "Julia Tan",
    "tk-3": "Alex Whitfield",
  });

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "URGENT" && t.priority === "URGENT") ||
        t.status === statusFilter;

      const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;

      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        (t.clubName && t.clubName.toLowerCase().includes(q)) ||
        t.ticketNumber.toString().includes(q);

      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [tickets, statusFilter, categoryFilter, query]);

  const selected = tickets.find((t) => t.id === selectedId) ?? filtered[0] ?? tickets[0];
  const assignedStaff = selected ? assignedStaffMap[selected.id] ?? "Alex Whitfield" : "Alex Whitfield";

  function sendReply() {
    if (!draft.trim() || !selected) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id !== selected.id
          ? t
          : {
              ...t,
              status: t.status === "OPEN" ? "IN_PROGRESS" : t.status,
              updatedAt: new Date().toISOString(),
              messages: [
                ...t.messages,
                {
                  id: `local-${Date.now()}`,
                  ticketId: t.id,
                  message: draft.trim(),
                  createdAt: new Date().toISOString(),
                  senderName: "Alex Whitfield",
                  isAdmin: true,
                },
              ],
            }
      )
    );
    setDraft("");
    toast.success("Reply dispatched to requester.");
  }

  function handleStatusChange(ticketId: string, nextStatus: TicketStatus) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t))
    );
    toast.success(`Ticket #${selected?.ticketNumber} status updated to ${nextStatus.replace("_", " ")}.`);
  }

  function handleAssignStaff(ticketId: string, staffName: string) {
    setAssignedStaffMap((prev) => ({ ...prev, [ticketId]: staffName }));
    toast.success(`Assigned to ${staffName}.`);
  }

  const openCount = tickets.filter((t) => t.status !== "RESOLVED").length;

  return (
    <div className="space-y-4 pb-6 min-w-0 flex flex-col h-[calc(100vh-100px)]">
      <PageHeader
        eyebrow="League Operations Desk"
        title="Support Desk"
        subtitle={`${openCount} open inquiries across managers, players & match officials`}
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-md border border-[#E5E7EB] shadow-xs shrink-0">
        {/* Status Filter Tabs */}
        <div className="flex gap-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-1 overflow-x-auto custom-scrollbar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === f.id ? "bg-[#1A1C1C] text-[#FFB800] shadow-xs" : "text-slate-500 hover:text-black hover:bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "ALL" | TicketCategory)}
              className="w-full appearance-none bg-[#F8F9FA] border border-[#E5E7EB] rounded-md pl-3 pr-7 py-1.5 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-semibold text-[#1A1C1C] placeholder:text-slate-400 focus:outline-none focus:border-[#FFB800]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container: Split Column Layout with Natural Flex Height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] gap-5 min-h-0 min-w-0">
        {/* Left Inquiries List */}
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold font-montserrat uppercase tracking-widest text-slate-400">
              Inquiries ({filtered.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-bold text-slate-500">No tickets found</p>
                <p className="text-[11px]">Try adjusting search or filters.</p>
              </div>
            ) : (
              filtered.map((t) => {
                const last = t.messages[t.messages.length - 1];
                const isSelected = selected?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left flex gap-3 p-3.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#FFF9E6]" : "hover:bg-[#F8F9FA]"
                    }`}
                  >
                    <Avatar name={t.requesterName} size="sm" tone={isSelected ? "gold" : "muted"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">
                          {t.requesterName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">{timeAgo(t.updatedAt)}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">{t.subject}</p>
                      <div className="flex items-center justify-between gap-1.5 mt-1.5">
                        <span className="text-[10px] text-slate-400 truncate">{t.clubName ?? t.requesterRole}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {t.priority === "URGENT" && (
                            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[9px] font-black uppercase">
                              Urgent
                            </span>
                          )}
                          <StatusPill label={t.status.replace("_", " ")} tone={STATUS_TONE[t.status]} dot={false} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation Panel */}
        {selected ? (
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs flex flex-col min-h-0 min-w-0 overflow-hidden">
            {/* Clean Two-Row Spacious Header */}
            <div className="p-4 border-b border-[#E5E7EB] bg-[#FAFBFB] shrink-0 space-y-3">
              {/* Row 1: Requester Profile & Action Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={selected.requesterName} size="md" tone="ink" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold font-montserrat text-[#1A1C1C] truncate">{selected.requesterName}</h3>
                      <span className="text-[10.5px] font-bold text-slate-400 bg-white border border-[#E5E7EB] px-1.5 py-0.2 rounded">
                        #{selected.ticketNumber}
                      </span>
                      {selected.priority === "URGENT" && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[9.5px] font-black uppercase">
                          Urgent Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {selected.requesterRole} {selected.clubName ? `· ${selected.clubName}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right Status & Assignment Dropdowns */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {/* Assigned Staff Selector */}
                  <div className="relative">
                    <select
                      value={assignedStaff}
                      onChange={(e) => handleAssignStaff(selected.id, e.target.value)}
                      className="appearance-none bg-white border border-[#E5E7EB] rounded-md pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FFB800] cursor-pointer"
                      title="Assigned staff handler"
                    >
                      {staffDirectory.map((s) => (
                        <option key={s.id} value={s.fullName}>
                          {s.fullName}
                        </option>
                      ))}
                      <option value="Alex Whitfield">Alex Whitfield (Admin)</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={selected.status}
                      onChange={(e) => handleStatusChange(selected.id, e.target.value as TicketStatus)}
                      className={`appearance-none rounded-md pl-2.5 pr-7 py-1 text-xs font-black font-montserrat uppercase cursor-pointer border ${
                        selected.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : selected.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : "bg-rose-50 text-rose-900 border-rose-300"
                      }`}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Ticket Subject Strip */}
              <div className="bg-white border border-[#E5E7EB] rounded-md px-3.5 py-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#1A1C1C] truncate">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-1.5">Subject:</span>
                  {selected.subject}
                </p>
                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 bg-[#F8F9FA] px-2 py-0.5 rounded">
                  {selected.category.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Conversation Messages Thread with Natural Scrolling */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 min-h-[220px]">
              {selected.messages.map((m) => (
                <div key={m.id} className={`flex gap-3 max-w-[80%] ${m.isAdmin ? "ml-auto flex-row-reverse" : ""}`}>
                  <Avatar name={m.senderName} size="sm" tone={m.isAdmin ? "gold" : "muted"} />
                  <div className={`flex flex-col gap-1 ${m.isAdmin ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.isAdmin
                          ? "bg-[#1A1C1C] text-white rounded-tr-xs shadow-xs"
                          : "bg-[#F8F9FA] text-[#1A1C1C] border border-[#E5E7EB] rounded-tl-xs"
                      }`}
                    >
                      {m.message}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
                      <span>{m.senderName}</span>
                      <span>·</span>
                      <span>{formatTime(m.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input Bar */}
            <div className="p-3.5 border-t border-[#E5E7EB] flex items-center gap-2.5 shrink-0 bg-[#FAFBFB]">
              <button
                type="button"
                onClick={() => toast.success("Attachment dialog opened.")}
                className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 cursor-pointer hover:border-[#FFB800] transition-colors"
                title="Attach match sheet or document"
              >
                <Paperclip size={15} className="text-slate-500" />
              </button>

              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
                placeholder="Type your response to the team manager or player..."
                className="flex-1 bg-white border border-[#E5E7EB] rounded-full px-4 py-2 text-xs font-medium text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
              />

              <button
                type="button"
                onClick={sendReply}
                className="w-9 h-9 rounded-full bg-[#1A1C1C] hover:bg-black text-[#FFB800] flex items-center justify-center shrink-0 cursor-pointer transition-colors border border-[#1A1C1C]"
                title="Send reply"
              >
                <Send size={14} className="text-[#FFB800]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs flex items-center justify-center p-12 text-slate-400">
            <p className="text-xs font-bold text-slate-500">Select an inquiry to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
