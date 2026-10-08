export type EntityType =
  | "organization"
  | "mission"
  | "flight"
  | "aircraft"
  | "person"
  | "airport"
  | "runway"
  | "procedure"
  | "weather"
  | "notam"
  | "maintenance"
  | "training"
  | "reservation"
  | "invoice"
  | "document";

export type OperationalSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ClaimStatus = "ASSERTED" | "SUPERSEDED" | "RETRACTED" | "EXPIRED";
export type ActionStatus = "PROPOSED" | "APPROVAL_REQUIRED" | "APPROVED" | "EXECUTING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface GraphRef {
  type: EntityType;
  id: string;
  label?: string;
}

export interface EvidenceRef {
  provider: string;
  product: string;
  sourceId?: string;
  sourceUrl?: string;
  observedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  revision?: string;
  excerpt?: string;
}

/**
 * Mission is the core operating unit in Aeros. A training lesson, helicopter
 * tour, Part 135 leg, ferry flight, maintenance reposition, or airline sector
 * can all be represented as a mission without changing the reasoning layer.
 */
export interface MissionNode {
  id: string;
  organizationId: string;
  kind: "TRAINING" | "RENTAL" | "TOUR" | "CHARTER" | "POSITIONING" | "COMMERCIAL" | "OTHER";
  status: "PLANNED" | "READY" | "AT_RISK" | "BLOCKED" | "ACTIVE" | "COMPLETE" | "CANCELLED";
  departure?: GraphRef;
  destination?: GraphRef;
  alternates?: GraphRef[];
  aircraft?: GraphRef;
  people?: GraphRef[];
  reservation?: GraphRef;
  trainingRecord?: GraphRef;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  tags?: string[];
  updatedAt: string;
}

/** Immutable event log. Every external update and human/system decision becomes an event. */
export interface OperationalEvent<T = unknown> {
  id: string;
  organizationId: string;
  missionId?: string;
  type: string;
  subject: GraphRef;
  occurredAt: string;
  ingestedAt: string;
  source: EvidenceRef;
  previousValue?: T;
  value?: T;
  affectedEntities?: GraphRef[];
  correlationId?: string;
}

/**
 * Agents publish claims to the operational blackboard. Other agents consume
 * these claims; they do not rely on a chain of conversational prose.
 */
export interface OperationalClaim<T = unknown> {
  id: string;
  organizationId: string;
  missionId?: string;
  subject: GraphRef;
  predicate: string;
  value: T;
  severity: OperationalSeverity;
  confidence: number;
  status: ClaimStatus;
  assertedBy: string;
  assertedAt: string;
  validFrom?: string;
  validTo?: string;
  dependencies: string[];
  evidence: EvidenceRef[];
  supersedes?: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  summary: string;
  feasible: boolean;
  score: number;
  risk: OperationalSeverity;
  expectedEffects: Array<{
    metric: string;
    direction: "IMPROVES" | "WORSENS" | "UNCHANGED" | "UNKNOWN";
    value?: string | number;
    explanation?: string;
  }>;
  requirements: string[];
  blockers: string[];
  supportingClaims: string[];
  proposedActions: string[];
}

export interface OperationalDecision {
  id: string;
  organizationId: string;
  missionId?: string;
  objective: string;
  triggerEventIds: string[];
  consideredClaimIds: string[];
  options: DecisionOption[];
  selectedOptionId?: string;
  selectedBy?: "AEROS" | "HUMAN";
  approvalRequired: boolean;
  createdAt: string;
  decidedAt?: string;
  modelVersion?: string;
  policyVersion?: string;
}

export interface OperationalAction {
  id: string;
  organizationId: string;
  missionId?: string;
  decisionId?: string;
  kind:
    | "UPDATE_RESERVATION"
    | "SWAP_AIRCRAFT"
    | "REASSIGN_CREW"
    | "DELAY_MISSION"
    | "CHANGE_ROUTE"
    | "CHANGE_ALTERNATE"
    | "CREATE_MAINTENANCE_TASK"
    | "NOTIFY_PERSON"
    | "REQUEST_REVIEW"
    | "OTHER";
  target: GraphRef;
  payload: Record<string, unknown>;
  status: ActionStatus;
  reversible: boolean;
  approval?: {
    required: boolean;
    role?: string;
    approvedBy?: string;
    approvedAt?: string;
  };
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  subscribesTo: string[];
  publishes: string[];
  tools: string[];
  deterministicChecks?: string[];
  humanAuthorityBoundary?: string[];
}

export interface MissionTwin {
  mission: MissionNode;
  claims: OperationalClaim[];
  recentEvents: OperationalEvent[];
  openDecisions: OperationalDecision[];
  pendingActions: OperationalAction[];
  snapshotAt: string;
}
