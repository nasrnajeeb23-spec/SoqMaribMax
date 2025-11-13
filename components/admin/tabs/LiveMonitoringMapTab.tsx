import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Delivery, Product, User } from '../../../types';
import { useDeliveries } from '../../../hooks/useDeliveries';
import { useProducts } from '../../../hooks/useProducts';
import { useAuth } from '../../../hooks/useAuth';

// Declare Leaflet to satisfy TypeScript since it's loaded from CDN
declare const L: any;

interface RouteSummary {
  totalTime: number; // in seconds
  totalDistance: number; // in meters
}

const LiveMonitoringMapTab: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const routeRef = useRef<any>(null);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
    const [selectedRouteSummary, setSelectedRouteSummary] = useState<RouteSummary | null>(null);

    const { deliveries } = useDeliveries();
    const { products } = useProducts();
    const { users } = useAuth();

    const getProductById = (id: string) => products.find(p => p.id === id);
    const getUserById = (id: string) => users.find(u => u.id === id);

    const activeDeliveries = useMemo(() => {
        return deliveries.filter(d => d.status === 'IN_TRANSIT' && d.current_location);
    }, [deliveries]);
    
    const selectedDelivery = useMemo(() => {
        return selectedDeliveryId ? deliveries.find(d => d.id === selectedDeliveryId) : null;
    }, [selectedDeliveryId, deliveries]);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([15.4545, 45.3187], 12); // Center on Marib city
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        }
    }, []);

    const createPopupContent = (delivery: Delivery, getProduct: (id: string) => Product | undefined, getUser: (id: string) => User | undefined): string => {
        const deliveryPerson = delivery.deliveryPersonId ? getUser(delivery.deliveryPersonId) : null;
        return `<h4 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #0284c7;">${deliveryPerson?.name || 'مندوب'}</h4><p>اضغط لعرض التفاصيل والمسار</p>`;
    };

    // Update markers and add click handlers
    useEffect(() => {
        if (!mapRef.current) return;

        const currentMarkerIds = new Set<string>();

        activeDeliveries.forEach(delivery => {
            const deliveryPerson = delivery.deliveryPersonId ? getUserById(delivery.deliveryPersonId) : null;
            if (!deliveryPerson || !delivery.current_location) return;

            const markerId = delivery.id;
            currentMarkerIds.add(markerId);

            const popupContent = createPopupContent(delivery, getProductById, getUserById);

            if (markersRef.current[markerId]) {
                markersRef.current[markerId]
                    .setLatLng([delivery.current_location.lat, delivery.current_location.lng])
                    .setPopupContent(popupContent);
            } else {
                const newMarker = L.marker([delivery.current_location.lat, delivery.current_location.lng])
                    .addTo(mapRef.current)
                    .bindPopup(popupContent);
                
                newMarker.on('click', () => {
                    setSelectedDeliveryId(delivery.id);
                });
                markersRef.current[markerId] = newMarker;
            }
        });
        
        Object.keys(markersRef.current).forEach(markerId => {
            if (!currentMarkerIds.has(markerId)) {
                mapRef.current.removeLayer(markersRef.current[markerId]);
                delete markersRef.current[markerId];
                if (selectedDeliveryId === markerId) {
                    setSelectedDeliveryId(null);
                }
            }
        });

    }, [activeDeliveries, getProductById, getUserById, selectedDeliveryId]);

    // Draw/update route for selected delivery
    useEffect(() => {
        if (!mapRef.current) return;
        
        setSelectedRouteSummary(null); // Reset summary on selection change
        if (routeRef.current) {
            mapRef.current.removeControl(routeRef.current);
            routeRef.current = null;
        }

        if (selectedDelivery) {
            const seller = getUserById(selectedDelivery.sellerId);
            const buyer = getUserById(selectedDelivery.buyerId);
            
            if (seller && buyer && seller.location && buyer.location) {
                const start = seller.location;
                const end = buyer.location;
                const waypoints = [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)];
                
                const routingControl = L.Routing.control({
                    waypoints,
                    show: false,
                    addWaypoints: false,
                    createMarker: () => null,
                    lineOptions: {
                        styles: [{ color: '#ef4444', opacity: 0.8, weight: 6 }]
                    }
                }).addTo(mapRef.current);

                routingControl.on('routesfound', (e: any) => {
                    if (e.routes && e.routes.length > 0) {
                        setSelectedRouteSummary(e.routes[0].summary);
                    }
                });
                
                routeRef.current = routingControl;
            }
        }
    }, [selectedDeliveryId, deliveries, getUserById]);

    return (
        <div className="relative">
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">المراقبة الحية لعمليات التوصيل</h2>
            
            {selectedDelivery && (
                 <div className="absolute top-16 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000] w-80 border">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-2">تفاصيل الطلب المحدد</h3>
                    <p><strong>المنتج:</strong> {getProductById(selectedDelivery.productId)?.name || 'N/A'}</p>
                    <p><strong>المندوب:</strong> {getUserById(selectedDelivery.deliveryPersonId || '')?.name || 'N/A'}</p>
                    <p><strong>من:</strong> {getUserById(selectedDelivery.sellerId)?.name || 'N/A'} ({getUserById(selectedDelivery.sellerId)?.city})</p>
                    <p><strong>إلى:</strong> {getUserById(selectedDelivery.buyerId)?.name || 'N/A'} ({getUserById(selectedDelivery.buyerId)?.city})</p>
                    {selectedRouteSummary && (
                        <div className="mt-2 pt-2 border-t text-center bg-sky-50 p-2 rounded-md">
                            <p className="font-semibold text-sky-800">الوقت التقديري للوصول: ~{Math.round(selectedRouteSummary.totalTime / 60)} دقيقة</p>
                        </div>
                    )}
                 </div>
            )}

            <div className="bg-sky-50 dark:bg-slate-900/50 p-3 rounded-md border border-sky-200 dark:border-sky-800 mb-4 text-sm text-sky-800 dark:text-sky-200">
                💡 اضغط على علامة أي مندوب لعرض مسار التوصيل الخاص به والتفاصيل.
            </div>
            <div ref={mapContainerRef} className="h-[600px] w-full rounded-lg shadow-md border" style={{ zIndex: 0 }}>
                {activeDeliveries.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
                        لا توجد عمليات توصيل نشطة حالياً.
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(LiveMonitoringMapTab);