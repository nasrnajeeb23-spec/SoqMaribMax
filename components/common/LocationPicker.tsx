import React, { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';

declare const L: any;

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
    initialPosition?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialPosition }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView(initialPosition || [15.4545, 45.3187], 13);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            const geocoder = L.Control.geocoder({
                defaultMarkGeocode: false,
                placeholder: 'ابحث عن مدينة أو عنوان...',
            }).on('markgeocode', function (e: any) {
                const { center, name } = e.geocode;
                map.fitBounds(e.geocode.bbox);
                if (markerRef.current) {
                    markerRef.current.setLatLng(center);
                } else {
                    markerRef.current = L.marker(center).addTo(map);
                }
                onLocationSelect({ lat: center.lat, lng: center.lng, name: name });
            }).addTo(map);
            
            map.on('click', function(e: any) {
                const { lat, lng } = e.latlng;
                if (markerRef.current) {
                    markerRef.current.setLatLng(e.latlng);
                } else {
                    markerRef.current = L.marker(e.latlng).addTo(map);
                }
                // Reverse geocode to get the name
                 geocoder.options.geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), (results: any) => {
                     const r = results[0];
                     if (r) {
                        onLocationSelect({ lat, lng, name: r.name });
                     }
                 });
            });
            
            if (initialPosition) {
                 markerRef.current = L.marker(initialPosition).addTo(map);
            }

            setLoading(false);
        }
    }, [initialPosition, onLocationSelect]);

    return (
        <div className="relative">
            {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Spinner /></div>}
            <div ref={mapContainerRef} className="h-64 w-full rounded-lg shadow-inner border border-[var(--color-border)]" style={{ zIndex: 0 }}></div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center">ابحث عن عنوان أو اضغط على الخريطة لتحديد الموقع.</p>
        </div>
    );
};

export default LocationPicker;