"use client";

import "leaflet/dist/leaflet.css";

import Link from "next/link";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUS_LABELS,
  RESOURCE_AVAILABILITY_LABELS,
  RESOURCE_TYPE_LABELS,
  type IncidentLocation,
  type IncidentStatus,
  type OfficerIncidentRecord,
  type ResourceAvailability,
  type ResourceRecord,
} from "@/types/incident";

const MAP_CENTER: [number, number] = [28.4744, 77.504];

const incidentColors: Record<IncidentStatus, string> = {
  submitted: "#0ea5e9",
  under_review: "#f59e0b",
  verified: "#2563eb",
  dispatched: "#7c3aed",
  resolved: "#059669",
  rejected: "#64748b",
};

const resourceColors: Record<ResourceAvailability, string> = {
  available: "#059669",
  deployed: "#7c3aed",
  unavailable: "#64748b",
};

function hasCoordinates(location: IncidentLocation) {
  return (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  );
}

export function IncidentMap({
  incidents,
  resources,
}: {
  incidents: OfficerIncidentRecord[];
  resources: ResourceRecord[];
}) {
  const mappedIncidents = incidents.filter((incident) =>
    hasCoordinates(incident.location)
  );
  const mappedResources = resources.filter((resource) =>
    hasCoordinates(resource.location)
  );

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {mappedIncidents.map((incident) => (
        <CircleMarker
          key={`incident-${incident.id}`}
          center={[
            incident.location.latitude as number,
            incident.location.longitude as number,
          ]}
          radius={9}
          pathOptions={{
            color: incidentColors[incident.status],
            fillColor: incidentColors[incident.status],
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">
                {incident.reportId}
              </p>
              <p className="font-medium">
                {INCIDENT_CATEGORY_LABELS[incident.category]}
              </p>
              <p className="text-xs">{incident.location.label}</p>
              <p className="text-xs">
                Status: {INCIDENT_STATUS_LABELS[incident.status]}
              </p>
              <Link
                href={`/officer/incidents/${incident.id}`}
                className="inline-block pt-1 text-xs font-medium underline underline-offset-2"
              >
                Open report
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {mappedResources.map((resource) => (
        <CircleMarker
          key={`resource-${resource.id}`}
          center={[
            resource.location.latitude as number,
            resource.location.longitude as number,
          ]}
          radius={7}
          pathOptions={{
            color: resourceColors[resource.availability],
            fillColor: resourceColors[resource.availability],
            fillOpacity: 0.7,
            weight: 2,
            dashArray: resource.availability === "available" ? undefined : "3 3",
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">
                {resource.resourceCode}
              </p>
              <p className="font-medium">{resource.name}</p>
              <p className="text-xs">{RESOURCE_TYPE_LABELS[resource.type]}</p>
              <p className="text-xs">
                {RESOURCE_AVAILABILITY_LABELS[resource.availability]}
              </p>
              <p className="text-xs">{resource.location.label}</p>
              <p className="text-xs text-muted-foreground">
                Supports:{" "}
                {resource.capabilities
                  .map((capability) => INCIDENT_CATEGORY_LABELS[capability])
                  .join(", ")}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
