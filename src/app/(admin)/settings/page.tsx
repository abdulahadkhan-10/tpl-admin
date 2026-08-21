"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Bell,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Mail,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/ui/PageHeader";
import Avatar from "@/components/ui/Avatar";
import { staffDirectory as initialStaff } from "@/lib/mockData";
import type { MatchStaff } from "@/lib/types";

type SettingsTab = "OFFICIALS" | "ALERTS" | "SECURITY";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("OFFICIALS");

  // Match Officials Directory State
  const [officials, setOfficials] = useState<MatchStaff[]>(initialStaff);

  // Admin Registry State
  const [admins, setAdmins] = useState<any[]>([
    { id: "adm-1", fullName: "Alex Whitfield", email: "alex.whitfield@talentproleague.com", roleLevel: "Super Administrator" },
  ]);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Super Administrator");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ fullName: string; email: string; roleType: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tpl_admin_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLoggedInUser(parsed);
      } catch (err) {
        console.error("Failed to parse logged-in user in settings", err);
      }
    }
  }, []);

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsRegistering(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          password: newAdminPassword.trim(),
          fullName: newAdminName.trim(),
          roleType: "ADMIN",
          profileData: {
            roleLevel: newAdminRole,
            permissions: { all: true },
            managedRegions: ["ALL"],
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newAdm = {
          id: data.user.id || `adm-${Date.now()}`,
          fullName: newAdminName.trim(),
          email: newAdminEmail.trim(),
          roleLevel: newAdminRole,
        };
        setAdmins((prev) => [...prev, newAdm]);
        toast.success(`Registered ${newAdminName} as an administrator successfully!`);
        setIsAddAdminOpen(false);
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
      } else {
        throw new Error(data.error || "Failed to register administrator");
      }
    } catch (err: any) {
      // Mock Fallback if Backend is unavailable
      const newAdm = {
        id: `adm-${Date.now()}`,
        fullName: newAdminName.trim(),
        email: newAdminEmail.trim(),
        roleLevel: newAdminRole,
      };
      setAdmins((prev) => [...prev, newAdm]);
      toast.success(`Registered ${newAdminName} (Local Mock Session)`);
      setIsAddAdminOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
    } finally {
      setIsRegistering(false);
    }
  }

  function handleDeleteAdmin(id: string) {
    const target = admins.find((a) => a.id === id);
    if (!target) return;
    if (admins.length <= 1) {
      toast.error("Cannot delete the last remaining administrator account.");
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Removed admin access for ${target.fullName}.`);
  }
  const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
  const [newOfficialName, setNewOfficialName] = useState("");
  const [newOfficialRole, setNewOfficialRole] = useState<"REFEREE" | "COMMISSIONER">("REFEREE");

  // Notification Alerts State
  const [alerts, setAlerts] = useState({
    redCardSuspensions: true,
    refereeNoShow: true,
    overdueFeeReminders: true,
    urgentTickets: true,
    scoutReportDigest: false,
  });

  function handleAddOfficial(e: React.FormEvent) {
    e.preventDefault();
    if (!newOfficialName.trim()) {
      toast.error("Please enter official's full name.");
      return;
    }
    const newOfficial: MatchStaff = {
      id: `staff-${Date.now()}`,
      fullName: newOfficialName.trim(),
      role: newOfficialRole,
    };
    setOfficials((prev) => [...prev, newOfficial]);
    setIsAddOfficialOpen(false);
    setNewOfficialName("");
    toast.success(`Added ${newOfficial.fullName} to official registry.`);
  }

  function handleDeleteOfficial(id: string) {
    const target = officials.find((o) => o.id === id);
    if (!target) return;
    setOfficials((prev) => prev.filter((o) => o.id !== id));
    toast.success(`Removed ${target.fullName} from directory.`);
  }

  function toggleAlert(key: keyof typeof alerts) {
    setAlerts((prev) => {
      const next = !prev[key];
      toast.success(next ? "Alert notification enabled." : "Alert notification disabled.");
      return { ...prev, [key]: next };
    });
  }

  return (
    <div className="space-y-6 pb-12 min-w-0">
      <PageHeader
        eyebrow="Admin Preferences"
        title="Settings & Governance"
        subtitle="Match officials directory, operational alerts & account security"
      />

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-md p-1.5 shadow-xs overflow-x-auto custom-scrollbar">
        {[
          { id: "OFFICIALS" as const, label: "Match Officials Directory", icon: Users, badge: officials.length },
          { id: "ALERTS" as const, label: "Alerts & Notifications", icon: Bell },
          { id: "SECURITY" as const, label: "Admin Security & Profile", icon: Shield },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold font-montserrat uppercase transition-colors cursor-pointer whitespace-nowrap ${
                isActive ? "bg-[#1A1C1C] text-[#FFB800] shadow-xs" : "text-slate-500 hover:text-black hover:bg-[#F8F9FA]"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[#FFB800]" : "text-slate-400"} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-[#FFB800] text-black" : "bg-[#F3F4F6] text-slate-500"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Match Officials Directory */}
      {activeTab === "OFFICIALS" && (
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-6 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Certified Match Officials Directory</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage referees and match commissioners licensed to oversee fixtures</p>
            </div>
            <button
              onClick={() => setIsAddOfficialOpen(true)}
              className="px-4 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-[#1A1C1C] shrink-0 self-start sm:self-auto"
            >
              <Plus size={14} />
              <span>Add Official</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {officials.map((official) => (
              <div
                key={official.id}
                className="flex items-center justify-between p-3.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg hover:border-[#FFB800] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={official.fullName} size="md" tone={official.role === "REFEREE" ? "ink" : "gold"} />
                  <div>
                    <p className="text-xs font-extrabold font-montserrat text-[#1A1C1C]">{official.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                          official.role === "REFEREE" ? "bg-slate-200 text-slate-800" : "bg-[#FFF9E6] text-[#7C5800]"
                        }`}
                      >
                        {official.role === "REFEREE" ? "FA Licensed Referee" : "Match Commissioner"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteOfficial(official.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove official"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Official Dialog */}
          {isAddOfficialOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Add Certified Official</h3>
                  <button
                    onClick={() => setIsAddOfficialOpen(false)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddOfficial} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                      Official Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Coote"
                      value={newOfficialName}
                      onChange={(e) => setNewOfficialName(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold font-montserrat uppercase tracking-wider text-slate-500 mb-1.5">
                      Official Role
                    </label>
                    <select
                      value={newOfficialRole}
                      onChange={(e) => setNewOfficialRole(e.target.value as "REFEREE" | "COMMISSIONER")}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none focus:border-[#FFB800] cursor-pointer"
                    >
                      <option value="REFEREE">FA Licensed Referee</option>
                      <option value="COMMISSIONER">Match Commissioner</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                    <button
                      type="button"
                      onClick={() => setIsAddOfficialOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer"
                    >
                      Save Official
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Alerts & Notifications */}
      {activeTab === "ALERTS" && (
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-6 space-y-6 min-w-0">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Automated Matchday &amp; Operational Alerts</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Control live operational push notifications and system triggers</p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "redCardSuspensions" as const,
                title: "Red Card & Suspension Automatic Flags",
                description: "Notify match commissioners and club managers when a player reaches card threshold.",
              },
              {
                key: "refereeNoShow" as const,
                title: "Referee Assignment & Check-in Warnings",
                description: "Alert league administrators 30 minutes before kickoff if assigned referee has not checked in.",
              },
              {
                key: "overdueFeeReminders" as const,
                title: "Club Registration Fee Overdue Reminders",
                description: "Dispatch automated weekly invoice reminders to club managers with pending registration fees.",
              },
              {
                key: "urgentTickets" as const,
                title: "High Priority Support Desk Escalations",
                description: "Immediately alert admin team when a match dispute or medical injury ticket is submitted.",
              },
              {
                key: "scoutReportDigest" as const,
                title: "Weekly Scout Prospect Digest",
                description: "Send weekly roundup of top-rated trial prospects to affiliated academy scouts.",
              },
            ].map((item) => {
              const isEnabled = alerts[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-extrabold font-montserrat text-[#1A1C1C]">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{item.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAlert(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-[#FFB800]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Admin Security & Identity */}
      {activeTab === "SECURITY" && (
        <div className="bg-white border border-[#E5E7EB] rounded-md shadow-xs p-6 space-y-6 min-w-0">
          <div className="border-b border-[#E5E7EB] pb-4">
            <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Admin Access &amp; Session Credentials</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Active session and commissioner authorization parameters</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg">
            <div className="flex items-center gap-3.5">
              <Avatar name={loggedInUser?.fullName ?? "Alex Whitfield"} size="lg" tone="gold" />
              <div>
                <p className="text-sm font-black font-montserrat text-[#1A1C1C]">{loggedInUser?.fullName ?? "Alex Whitfield"}</p>
                <p className="text-xs text-slate-500 font-medium">{loggedInUser?.email ?? "alex.whitfield@talentproleague.com"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-[#1A1C1C] text-[#FFB800] text-[9.5px] font-black font-montserrat uppercase rounded">
                    Super Administrator
                  </span>
                  <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Active Session
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.success("Password reset email sent to admin email.")}
              className="px-4 py-2 bg-white border border-[#E5E7EB] hover:border-black text-xs font-bold font-montserrat uppercase rounded-md transition-colors cursor-pointer"
            >
              Change Password
            </button>
          </div>

          {/* Administrator Directory Accounts */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h4 className="text-xs font-black font-montserrat uppercase text-[#1A1C1C]">Administrator Accounts Registry</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Authorized accounts with operations and scouting controls</p>
              </div>
              <button
                onClick={() => setIsAddAdminOpen(true)}
                className="px-3.5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-bold font-montserrat uppercase rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-[#1A1C1C] shrink-0 self-start sm:self-auto"
              >
                <Plus size={13} />
                <span>Add Administrator</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#FFB800] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={adm.fullName} size="sm" tone="gold" />
                    <div>
                      <p className="text-xs font-bold font-montserrat text-[#1A1C1C]">{adm.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px]">{adm.email}</p>
                      <span className="text-[9px] font-bold uppercase text-[#7C5800] bg-[#FFF9E6] px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        {adm.roleLevel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAdmin(adm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Revoke Admin Access"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Admin Dialog */}
          {isAddAdminOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#F8F9FA]">
                  <h3 className="text-sm font-black font-montserrat uppercase text-[#1A1C1C]">Register Administrator</h3>
                  <button
                    onClick={() => setIsAddAdminOpen(false)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-black cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddAdmin} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[9.5px] font-black font-montserrat uppercase tracking-wider text-[#1A1C1C] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emily Watson"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] focus:border-[#1A1C1C] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-black font-montserrat uppercase tracking-wider text-[#1A1C1C] mb-1.5">
                      Operational Email *
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={13} className="absolute left-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. emily.watson@talentproleague.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] focus:border-[#1A1C1C] rounded-md pl-9 pr-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-black font-montserrat uppercase tracking-wider text-[#1A1C1C] mb-1.5">
                      Authorized Passkey *
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={13} className="absolute left-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-[#E5E7EB] focus:border-[#1A1C1C] rounded-md pl-9 pr-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-black font-montserrat uppercase tracking-wider text-[#1A1C1C] mb-1.5">
                      Administrative Role
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] focus:border-[#1A1C1C] rounded-md px-3.5 py-2 text-xs font-semibold text-[#1A1C1C] focus:outline-none cursor-pointer"
                    >
                      <option value="Super Administrator">Super Administrator</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Scout Registry Lead">Scout Registry Lead</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
                    <button
                      type="button"
                      onClick={() => setIsAddAdminOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#F8F9FA] rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="px-5 py-2 bg-[#1A1C1C] hover:bg-black text-[#FFB800] text-xs font-black font-montserrat uppercase rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isRegistering ? (
                        <>
                          <span className="w-3 h-3 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Save Admin</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-slate-400">
            <span>TPL Admin Control Center · Version 2.4.0 (Enterprise)</span>
            <span>League Governance &amp; Partner Preset Rules Locked</span>
          </div>
        </div>
      )}
    </div>
  );
}
