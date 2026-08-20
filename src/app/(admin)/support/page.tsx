"use client";

import { useMemo, useState } from "react";
import { Search, Send, Paperclip, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import StatusPill from "@/components/ui/StatusPill";
import { supportTickets as initialTickets } from "@/lib/mockData";
import { formatTime, timeAgo } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const FILTERS = ["All", "Open", "Urgent"] as const;

const STATUS_TONE: Record<TicketStatus, "warning" | "info" | "success"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialTickets[0].id);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesFilter = filter === "All" || (filter === "Open" && t.status !== "RESOLVED") || (filter === "Urgent" && t.priority === "URGENT");
      const matchesQuery = t.subject.toLowerCase().includes(query.toLowerCase()) || t.requesterName.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [tickets, filter, query]);

  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0];

  function sendReply() {
    if (!draft.trim()) return;
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
                { id: `local-${Date.now()}`, ticketId: t.id, message: draft.trim(), createdAt: new Date().toISOString(), senderName: "Alex Whitfield", isAdmin: true },
              ],
            }
      )
    );
    setDraft("");
    toast.success("Reply sent");
  }

  return (
    <div className="space-y-6 pb-6 h-full flex flex-col">
      <PageHeader eyebrow="League Operations" title="Support Desk" subtitle={`${tickets.filter((t) => t.status !== "RESOLVED").length} open tickets across managers, players & staff`} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 min-h-0">
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs flex flex-col min-h-0">
          <div className="p-4 border-b border-[#E5E7EB] space-y-3 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs font-medium focus:outline-none focus:border-[#FFB800]"
              />
            </div>
            <div className="flex gap-1 bg-[#F8F9FA] rounded-md p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-bold font-montserrat uppercase transition-colors cursor-pointer ${
                    filter === f ? "bg-[#FFB800] text-black" : "text-slate-500 hover:bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filtered.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left flex gap-3 p-3.5 border-b border-[#E5E7EB] last:border-b-0 cursor-pointer transition-colors ${
                    selectedId === t.id ? "bg-[#FFF9E6]" : "hover:bg-[#F8F9FA]"
                  }`}
                >
                  <Avatar name={t.requesterName} size="sm" tone="muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-montserrat text-[#1A1C1C] truncate">
                        {t.requesterName} <span className="text-slate-400 font-medium">· {t.requesterRole}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">{timeAgo(t.updatedAt)}</span>
                    </div>
                    <p className="text-xs font-bold text-[#1A1C1C] truncate mt-0.5">{t.subject}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-[11px] text-slate-400 truncate">{last?.message}</p>
                      {t.priority === "URGENT" && <StatusPill label="Urgent" tone="danger" dot={false} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs flex flex-col min-h-0">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar name={selected.requesterName} size="md" tone="muted" />
              <div>
                <p className="text-sm font-bold font-montserrat text-[#1A1C1C]">{selected.requesterName}</p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {selected.requesterRole} {selected.clubName ? `· ${selected.clubName}` : ""} · {selected.subject}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selected.priority === "URGENT" && <StatusPill label="Urgent" tone="danger" dot={false} />}
              <button
                onClick={() =>
                  setTickets((prev) =>
                    prev.map((t) => (t.id === selected.id ? { ...t, status: t.status === "RESOLVED" ? "OPEN" : "RESOLVED" } : t))
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold font-montserrat bg-white hover:bg-[#F8F9FA] cursor-pointer"
                style={{ borderColor: "#E5E7EB" }}
              >
                <StatusPill label={selected.status.replace("_", " ")} tone={STATUS_TONE[selected.status]} />
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {selected.messages.map((m) => (
              <div key={m.id} className={`flex gap-2.5 max-w-[75%] ${m.isAdmin ? "ml-auto flex-row-reverse" : ""}`}>
                <Avatar name={m.senderName} size="sm" tone={m.isAdmin ? "gold" : "muted"} />
                <div className={`flex flex-col gap-1 ${m.isAdmin ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.isAdmin ? "bg-[#1A1C1C] text-white rounded-tr-sm" : "bg-[#F8F9FA] text-[#1A1C1C] rounded-tl-sm"
                    }`}
                  >
                    {m.message}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold px-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E5E7EB] flex items-center gap-2.5 shrink-0">
            <button className="w-9 h-9 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center shrink-0 cursor-pointer hover:border-[#FFB800]">
              <Paperclip size={15} className="text-slate-500" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Type a reply..."
              className="flex-1 bg-[#F8F9FA] border border-[#E5E7EB] rounded-full px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#FFB800]"
            />
            <button
              onClick={sendReply}
              className="w-9 h-9 rounded-full bg-[#FFB800] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#e6a600] transition-colors"
            >
              <Send size={15} className="text-[#1A1C1C]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
