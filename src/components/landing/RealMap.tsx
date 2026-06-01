'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RealMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Prevent double-initialization in React StrictMode
    if (mapRef.current) return;

    // Center coordinates between Huế, Đà Nẵng, and Hội An
    // 16.18 is roughly the latitude between Da Nang (16.05) and Hue (16.46)
    const centerLat = 16.18;
    const centerLng = 108.0;
    const zoomLevel = 9;

    // Initialize Leaflet map
    const mapOptions: any = {
      zoomControl: true,
      scrollWheelZoom: false, // Prevent accidental scrolling when scrolling page
      dragging: !L.Browser.mobile, // Disable dragging on mobile to allow page scroll
      tap: !L.Browser.mobile,
    };
    const map = L.map(mapContainerRef.current, mapOptions).setView([centerLat, centerLng], zoomLevel);

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Coordinates for the 3 cities
    const hueCoords: [number, number] = [16.4637, 107.5909];
    const danangCoords: [number, number] = [16.0544, 108.2022];
    const hoianCoords: [number, number] = [15.8801, 108.3380];

    // Helper to create custom HTML DivIcon marker
    const createCustomMarker = (title: string, subtitle: string, color: string) => {
      return L.divIcon({
        className: 'custom-map-marker-icon',
        html: `
          <div class="map-marker-wrapper">
            <div class="map-marker-pin" style="background-color: ${color}; box-shadow: 0 0 0 4px ${color}20;">
              <div class="map-marker-dot"></div>
            </div>
            <div class="map-marker-card animate-fade-in">
              <div class="map-marker-title">${title}</div>
              <div class="map-marker-sub">${subtitle}</div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Add Hue marker (Gold/Amber theme)
    L.marker(hueCoords, {
      icon: createCustomMarker('Huế', 'Cố đô trầm mặc', '#c88925'),
    }).addTo(map);

    // Add Da Nang marker (Golden theme)
    L.marker(danangCoords, {
      icon: createCustomMarker('Đà Nẵng', 'Thành phố đáng sống', '#e5aa35'),
    }).addTo(map);

    // Add Hoi An marker (Teal/Cyan theme)
    L.marker(hoianCoords, {
      icon: createCustomMarker('Hội An', 'Phố cổ yên bình', '#0c7f8d'),
    }).addTo(map);

    // Midpoints for duration labels
    const hueDanangMid: [number, number] = [16.259, 107.897];
    const danangHoianMid: [number, number] = [15.967, 108.270];

    // Helper for duration text labels
    const createDurationLabel = (text: string, bgColor: string) => {
      return L.divIcon({
        className: 'map-duration-label-icon',
        html: `
          <div class="map-duration-pill" style="background-color: ${bgColor};">
            ${text}
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });
    };

    // Add duration label markers
    L.marker(hueDanangMid, {
      icon: createDurationLabel('~2 giờ', '#c88925'),
    }).addTo(map);

    L.marker(danangHoianMid, {
      icon: createDurationLabel('~45 phút', '#0c7f8d'),
    }).addTo(map);

    // Draw Route Polyline connecting Hue -> Da Nang -> Hoi An
    const routeCoordinates = [hueCoords, danangCoords, hoianCoords];
    L.polyline(routeCoordinates, {
      color: '#c88925',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Clean up map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="leaflet-map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-container" />
    </div>
  );
}
