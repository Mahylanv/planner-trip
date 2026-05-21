"use client";

import { useEffect, useRef } from "react";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";

export type RealMapMarker = {
  id: string;
  title: string;
  emoji: string;
  code: string;
  accent: string;
  coordinates: [number, number];
};

export function RealMap({
  markers,
  selectedId,
  onSelect,
}: {
  markers: RealMapMarker[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function mountMap() {
      if (!mapElementRef.current || mapRef.current || markers.length === 0) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled || !mapElementRef.current) {
        return;
      }

      const map = L.map(mapElementRef.current, {
        center: [-15, -60],
        zoom: 3,
        minZoom: 2,
        maxZoom: 9,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
    }

    mountMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [markers.length]);

  useEffect(() => {
    let cancelled = false;

    async function drawMarkers() {
      const map = mapRef.current;

      if (!map) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled) {
        return;
      }

      map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      });

      const route: LatLngExpression[] = markers.map((marker) => marker.coordinates);

      if (route.length > 1) {
        L.polyline(route, {
          color: "#087d8f",
          dashArray: "6 8",
          opacity: 0.8,
          weight: 3,
        }).addTo(map);
      }

      markers.forEach((marker) => {
        const isSelected = marker.id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: `<button class="leaflet-trip-pin ${isSelected ? "active" : ""}" style="--pin-accent:${marker.accent}" type="button"><span>${marker.emoji}</span><strong>${marker.code}</strong></button>`,
          iconAnchor: [36, 22],
          iconSize: [72, 44],
        });

        L.marker(marker.coordinates, { icon })
          .addTo(map)
          .on("click", () => onSelect(marker.id))
          .bindTooltip(marker.title, { direction: "top", offset: [0, -18] });
      });

      const selected = markers.find((marker) => marker.id === selectedId);

      if (selected) {
        map.setView(selected.coordinates, Math.max(map.getZoom(), 4), { animate: true });
      } else if (route.length > 0) {
        map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
      }
    }

    drawMarkers();

    return () => {
      cancelled = true;
    };
  }, [markers, onSelect, selectedId]);

  return <div ref={mapElementRef} className="real-map" />;
}
