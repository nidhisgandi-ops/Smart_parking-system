import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParkingFacility, NoParkingZone } from '../types';

interface MapComponentProps {
  facilities: ParkingFacility[];
  selectedFacility: ParkingFacility | null;
  onSelectFacility: (facility: ParkingFacility) => void;
  noParkingZones: NoParkingZone[];
  userLocation: { lat: number, lng: number };
  valetLocation?: { lat: number, lng: number };
  pickupLocation?: { lat: number, lng: number };
  isDraggablePickup?: boolean;
  onPickupDrag?: (coords: { lat: number, lng: number }) => void;
  onMapClick?: (lat: number, lng: number) => void;
  getVacantSpotsCount: (facilityId: string) => number;
  className?: string;
  isDarkMode?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  noParkingZones,
  userLocation,
  valetLocation,
  pickupLocation,
  isDraggablePickup = false,
  onPickupDrag,
  onMapClick,
  getVacantSpotsCount,
  className = 'h-96 w-full',
  isDarkMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const valetRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = selectedFacility
        ? [selectedFacility.lat, selectedFacility.lng]
        : [userLocation.lat, userLocation.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
      });

      // Add zoom control at bottom-right for thumb accessibility on mobile
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile Layer (CartoDB Positron / Dark Matter depending on dark mode)
      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Layers
      polygonsLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      valetRouteLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle Map Click
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center on selected facility
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedFacility) return;
    mapInstanceRef.current.panTo([selectedFacility.lat, selectedFacility.lng], { animate: true });
  }, [selectedFacility]);

  // Update No-Parking Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsLayerRef.current) return;
    polygonsLayerRef.current.clearLayers();

    noParkingZones.forEach((zone) => {
      // Draw red polygon
      const polygon = L.polygon(zone.coordinates, {
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        dashArray: '5, 5',
      });

      // Popup on click
      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background-color: #fee2e2; color: #dc2626; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">NO PARKING ZONE</span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b;">${zone.name}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${zone.reason}</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 6px; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #991b1b;">⚠️ Fine: ${zone.currency}${zone.fineAmount} + Towing</div>
          </div>
          <div style="font-size: 11px; color: #047857; font-weight: 500;">
            ✓ Safe Alternative: ${zone.legalAlternative}
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent);
      polygonsLayerRef.current?.addLayer(polygon);

      // Center warning icon
      const centerLat = zone.coordinates.reduce((acc, c) => acc + c[0], 0) / zone.coordinates.length;
      const centerLng = zone.coordinates.reduce((acc, c) => acc + c[1], 0) / zone.coordinates.length;

      const warningIcon = L.divIcon({
        className: 'custom-no-park-icon',
        html: `
          <div style="background: #dc2626; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); border: 2px solid white;">
            ✕
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const warningMarker = L.marker([centerLat, centerLng], { icon: warningIcon });
      warningMarker.bindPopup(popupContent);
      polygonsLayerRef.current?.addLayer(warningMarker);
    });
  }, [noParkingZones]);

  // Update Facility Markers & User Location
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. User Location Marker
    const userIcon = L.divIcon({
      className: 'user-pin-icon',
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; width: 22px; height: 22px; background: #3b82f6; border-radius: 50%; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindTooltip('Your Location', { permanent: false, direction: 'top' });
    markersLayerRef.current.addLayer(userMarker);

    // 2. Parking Facilities Markers
    facilities.forEach((facility) => {
      const vacantCount = getVacantSpotsCount(facility.id);
      const isSelected = selectedFacility?.id === facility.id;

      const markerHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
          <div style="
            background: ${isSelected ? '#059669' : '#10b981'};
            color: white;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${vacantCount > 5 ? '#34d399' : '#f59e0b'};"></span>
            <span>${vacantCount} Free</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${isSelected ? '#059669' : '#10b981'};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const facilityIcon = L.divIcon({
        className: 'facility-marker-icon',
        html: markerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 36],
      });

      const marker = L.marker([facility.lat, facility.lng], { icon: facilityIcon });

      marker.on('click', () => {
        onSelectFacility(facility);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [facilities, selectedFacility, userLocation, getVacantSpotsCount, onSelectFacility]);

  // Update Valet Route & Live Location
  useEffect(() => {
    if (!mapInstanceRef.current || !valetRouteLayerRef.current) return;
    valetRouteLayerRef.current.clearLayers();

    // Draggable / Static Pickup Location
    if (pickupLocation) {
      const pickupIcon = L.divIcon({
        className: 'pickup-pin-icon',
        html: `
          <div style="background: #6366f1; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4); border: 2px solid white;">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const pMarker = L.marker([pickupLocation.lat, pickupLocation.lng], {
        icon: pickupIcon,
        draggable: isDraggablePickup,
      });

      if (isDraggablePickup && onPickupDrag) {
        pMarker.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          onPickupDrag({ lat: latlng.lat, lng: latlng.lng });
        });
      }

      pMarker.bindTooltip(isDraggablePickup ? 'Drag to Adjust Pickup Point' : 'Pickup Point', {
        permanent: true,
        direction: 'top',
      });

      pickupMarkerRef.current = pMarker;
      valetRouteLayerRef.current.addLayer(pMarker);
    }

    // Live Valet Marker
    if (valetLocation) {
      const valetIcon = L.divIcon({
        className: 'valet-scooter-icon',
        html: `
          <div style="position: relative; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; background: #10b981; border-radius: 50%; opacity: 0.3; animation: ping 1.8s infinite;"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 30px; height: 30px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
              🛵
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const vMarker = L.marker([valetLocation.lat, valetLocation.lng], { icon: valetIcon });
      vMarker.bindTooltip('Valet En Route (4 min)', { permanent: true, direction: 'bottom' });
      valetRouteLayerRef.current.addLayer(vMarker);

      // Route Polyline from Valet to Pickup
      if (pickupLocation) {
        const polyline = L.polyline(
          [
            [valetLocation.lat, valetLocation.lng],
            [pickupLocation.lat, pickupLocation.lng],
          ],
          {
            color: '#10b981',
            weight: 4,
            dashArray: '6, 8',
            opacity: 0.85,
          }
        );
        valetRouteLayerRef.current.addLayer(polyline);
      }
    }
  }, [valetLocation, pickupLocation, isDraggablePickup, onPickupDrag]);

  return <div ref={mapContainerRef} className={`${className} rounded-2xl z-0 overflow-hidden shadow-inner`} />;
};
