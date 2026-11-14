export const INCIDENT_CATEGORIES = [
  "fire",
  "road_accident",
  "flooding",
  "building_damage",
  "medical_emergency",
  "other",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  fire: "Fire",
  road_accident: "Road accident",
  flooding: "Flooding / waterlogging",
  building_damage: "Building damage",
  medical_emergency: "Medical emergency",
  other: "Other",
};

export const INCIDENT_STATUSES = [
  "submitted",
  "under_review",
  "verified",
  "dispatched",
  "resolved",
  "rejected",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  verified: "Verified",
  dispatched: "Dispatched",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ACTIVE_INCIDENT_STATUSES: IncidentStatus[] = [
  "submitted",
  "under_review",
  "verified",
  "dispatched",
];

export type IncidentLocation = {
  label: string;
  latitude?: number;
  longitude?: number;
};

/**
 * Incident shape returned by the DISHA API for a citizen's own report.
 * Officer notes are deliberately absent from citizen responses.
 */
export type IncidentRecord = {
  id: string;
  reportId: string;
  category: IncidentCategory;
  description: string;
  location: IncidentLocation;
  imageUrl?: string;
  severity?: Severity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
};

/**
 * Officer responses may include internal notes. Citizen responses never do.
 */
export type OfficerIncidentRecord = IncidentRecord & {
  officerNotes?: string;
};

export type OfficerDashboardData = {
  kpis: {
    activeIncidents: number;
    awaitingVerification: number;
    highPriority: number;
    availableResources: number;
  };
  recentIncidents: OfficerIncidentRecord[];
};

/**
 * Demo resource inventory shapes returned by the officer API.
 */
export const RESOURCE_TYPES = [
  "ambulance",
  "fire_unit",
  "rescue_team",
  "shelter",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  ambulance: "Ambulance",
  fire_unit: "Fire unit",
  rescue_team: "Rescue team",
  shelter: "Shelter",
};

export const RESOURCE_AVAILABILITIES = [
  "available",
  "deployed",
  "unavailable",
] as const;

export type ResourceAvailability = (typeof RESOURCE_AVAILABILITIES)[number];

export const RESOURCE_AVAILABILITY_LABELS: Record<ResourceAvailability, string> = {
  available: "Available",
  deployed: "Deployed",
  unavailable: "Unavailable",
};

export type ResourceRecord = {
  id: string;
  resourceCode: string;
  name: string;
  type: ResourceType;
  capabilities: IncidentCategory[];
  location: IncidentLocation;
  availability: ResourceAvailability;
  createdAt: string;
  updatedAt: string;
};

export type ResourceRecommendation = ResourceRecord & {
  distanceKm?: number;
  explanation: string;
};

export type RecommendationsResponse = {
  incident: OfficerIncidentRecord;
  recommendations: ResourceRecommendation[];
  proximityAvailable: boolean;
  message?: string;
};

export const DEPLOYMENT_STATUSES = [
  "assigned",
  "completed",
  "cancelled",
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  assigned: "Assigned",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type DeploymentIncidentSummary = {
  id: string;
  reportId: string;
  category: IncidentCategory;
  status: IncidentStatus;
  location: IncidentLocation;
};

export type DeploymentResourceSummary = {
  id: string;
  resourceCode: string;
  name: string;
  type: ResourceType;
  availability: ResourceAvailability;
  location: IncidentLocation;
};

export type ActiveDeployment = {
  id: string;
  status: DeploymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  resource: DeploymentResourceSummary | null;
};

export type OfficerDeploymentRecord = ActiveDeployment & {
  incident: DeploymentIncidentSummary | null;
};

export type OfficerIncidentDetailResponse = {
  incident: OfficerIncidentRecord;
  activeDeployment: ActiveDeployment | null;
};

export type DeploymentMutationResponse = {
  incident: OfficerIncidentRecord;
  activeDeployment: ActiveDeployment | null;
};

export function isActiveIncident(incident: {
  status: IncidentStatus;
  severity?: Severity;
}) {
  return ACTIVE_INCIDENT_STATUSES.includes(incident.status);
}

export function isAwaitingVerification(incident: { status: IncidentStatus }) {
  return (
    incident.status === "submitted" || incident.status === "under_review"
  );
}

export function isHighPriority(incident: {
  status: IncidentStatus;
  severity?: Severity;
}) {
  return (
    isActiveIncident(incident) &&
    (incident.severity === "high" || incident.severity === "critical")
  );
}
