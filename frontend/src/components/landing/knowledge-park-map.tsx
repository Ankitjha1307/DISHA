"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const knowledgeParkCenter: [number, number] = [28.4744, 77.504];

export default function KnowledgeParkMap() {
  return (
    <MapContainer
      center={knowledgeParkCenter}
      zoom={14}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Knowledge Park 2 marker */}
      <Marker position={knowledgeParkCenter}>
        <Popup>
          <div className="text-sm">
            <strong>Knowledge Park II</strong>
            <br />
            Greater Noida, Uttar Pradesh
          </div>
        </Popup>
      </Marker>
      
      {/* Illustrative incident markers */}
      <Marker position={[28.4765, 77.5065]}>
        <Popup>
          <div className="text-sm">
            <strong className="text-orange-600">Incident (Illustrative)</strong>
            <br />
            Road Accident
          </div>
        </Popup>
      </Marker>
      
      <Marker position={[28.472, 77.5015]}>
        <Popup>
          <div className="text-sm">
            <strong className="text-blue-600">Assistance Hub (Illustrative)</strong>
            <br />
            First Response Point
          </div>
        </Popup>
      </Marker>
      
      <Marker position={[28.478, 77.502]}>
        <Popup>
          <div className="text-sm">
            <strong className="text-emerald-600">Relief Center (Illustrative)</strong>
            <br />
            Medical Support
          </div>
        </Popup>
      </Marker>
      
      {/* Subtle coverage area for demo */}
      <Circle
        center={knowledgeParkCenter}
        radius={800}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.05,
          weight: 1,
        }}
      />
    </MapContainer>
  );
}
