// Types mirrored from tpl-backend/prisma/schema.prisma where a model already
// exists there (Team, TeamManager, Player, Ticket, TicketMessage). Fixture,
// StandingRow and MatchStaff have no backend model yet — they are shaped the
// way the eventual API response will likely look, so wiring real data in
// later is a drop-in swap rather than a rewrite.

export type RegistrationFeeStatus = "PAID" | "PENDING" | "OVERDUE";

export interface TeamManager {
  id: string;
  fullName: string;
  role: string;
  email?: string | null;
  contactNumber: string;
}

export interface MatchStaff {
  id: string;
  fullName: string;
  role: "REFEREE" | "COMMISSIONER";
}

export interface Club {
  id: string;
  name: string;
  code: string; // short crest code, e.g. "RV"
  region: string;
  ageGroup: string;
  cityOrTown?: string | null;
  logoUrl?: string | null;
  registrationFeePaid: boolean;
  registrationFeeStatus: RegistrationFeeStatus;
  registrationFeeAmount: number;
  registrationFeeDate?: string | null;
  playerCount: number;
  avgAge: number;
  founded: number;
  manager: TeamManager;
  assignedStaff: MatchStaff[];
  verified: boolean;
  createdAt: string;
}

export interface ScoutAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  fullName: string;
  email: string;
  position: string;
  jerseyNumber: number;
  dateOfBirth: string;
  nationality?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  pricingTier: string;
  scoutGrade: number | null;
  attributes: ScoutAttributes;
  shirtSize: string | null;
  shortsSize: string | null;
  sockSize: string | null;
  medicalConditions?: string | null;
  medicalFlags: { label: string; severity: "OK" | "WARNING" }[];
  isMvpFeatured: boolean;
  scoutNote?: string | null;
  scoutedBy?: string | null;
  scoutedAt?: string | null;
}

export type FixtureStatus = "SCHEDULED" | "LIVE" | "FULL_TIME" | "POSTPONED";

export interface GoalEvent {
  id: string;
  fixtureId: string;
  clubId: string;
  playerId?: string | null;
  scorerName: string;
  minute: number;
  type?: "REGULAR" | "PENALTY" | "OWN_GOAL";
  assistName?: string | null;
}

export interface CardEvent {
  id: string;
  fixtureId: string;
  clubId: string;
  playerId?: string | null;
  playerName: string;
  minute: number;
  cardType: "YELLOW" | "RED";
  reason?: string | null;
}

export interface Fixture {
  id: string;
  homeClubId: string;
  awayClubId: string;
  kickoff: string;
  venue: string;
  pitch: string;
  refereeId?: string | null;
  commissionerId?: string | null;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  goals?: GoalEvent[];
  cards?: CardEvent[];
}

export interface StandingRow {
  position: number;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  pointsPenalty: number;
  points: number;
  form: ("W" | "D" | "L")[];
  zone: "PROMOTION" | "RELEGATION" | null;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketCategory =
  | "GENERAL"
  | "EQUIPMENT"
  | "REGISTRATION"
  | "MATCH_SCHEDULE"
  | "MEDICAL"
  | "DISPUTE"
  | "OTHERS";
export type TicketPriority = "URGENT" | "NORMAL";

export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  senderName: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  requesterName: string;
  requesterRole: "Team Manager" | "Player" | "Commissioner" | "Scout";
  clubName?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}
