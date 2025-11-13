import React, { useEffect, useRef } from 'react';

// Leaflet is loaded via CDN, so we can access it via the window object.
// We declare it to satisfy TypeScript.
declare const L: any;

interface DeliveryMapProps {
  liveLocation?: { lat: number; lng: number };
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  onRouteSummary?: (summary: { totalTime: number; totalDistance: number; }) => void;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ liveLocation, startLocation, endLocation, onRouteSummary }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const routeRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialLocation = startLocation || { lat: 15.4545, lng: 45.3187 }; // Default center Marib
      mapRef.current = L.map(mapContainerRef.current).setView([initialLocation.lat, initialLocation.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  // Handle routing
  useEffect(() => {
    if (mapRef.current && startLocation && endLocation) {
        // Remove old route if it exists
        if (routeRef.current) {
            mapRef.current.removeControl(routeRef.current);
        }
        
        // Create new route control
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(startLocation.lat, startLocation.lng),
            L.latLng(endLocation.lat, endLocation.lng)
          ],
          routeWhileDragging: false,
          show: false, // Hide the instructions panel
          addWaypoints: false, // Don't allow adding waypoints
          createMarker: () => null, // Hide default start/end markers
          lineOptions: {
            styles: [{ color: '#0284c7', opacity: 0.8, weight: 6 }]
          }
        }).addTo(mapRef.current);

        routingControl.on('routesfound', (e: any) => {
            if (e.routes && e.routes.length > 0 && onRouteSummary) {
                onRouteSummary(e.routes[0].summary);
            }
        });
        
        routeRef.current = routingControl;

    } else if (mapRef.current && routeRef.current) {
      // Clean up route if start/end locations are removed
      mapRef.current.removeControl(routeRef.current);
      routeRef.current = null;
    }
  }, [startLocation, endLocation, onRouteSummary]);

  // Handle live marker
  useEffect(() => {
    if (mapRef.current && liveLocation) {
      const deliveryIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });
      
      if (!markerRef.current) {
        markerRef.current = L.marker([liveLocation.lat, liveLocation.lng], { icon: deliveryIcon })
          .addTo(mapRef.current)
          .bindPopup("المندوب هنا!")
          .openPopup();
      } else {
        markerRef.current.setLatLng([liveLocation.lat, liveLocation.lng]);
      }
      
      // Optionally pan the map to the live location
      // mapRef.current.panTo([liveLocation.lat, liveLocation.lng]);
    }
  }, [liveLocation]);


  return (
    <div ref={mapContainerRef} className="h-96 w-full rounded-lg shadow-md border" style={{ zIndex: 0 }}>
      {!liveLocation && !startLocation && <div className="flex items-center justify-center h-full text-gray-500">جاري تحميل الخريطة...</div>}
      {liveLocation === undefined && startLocation && <div className="flex items-center justify-center h-full text-gray-500">في انتظار تحديث الموقع من المندوب...</div>}
    </div>
  );
};

export default DeliveryMap;