import { useState, useEffect, useCallback } from 'react';

export function useZoom() {
    const [zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        const savedZoom = localStorage.getItem('app_zoom');
        if (savedZoom) setZoomLevel(parseFloat(savedZoom));
    }, []);

    useEffect(() => {
        localStorage.setItem('app_zoom', zoomLevel.toString());
    }, [zoomLevel]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoomLevel(prev => Math.min(prev + 0.1, 2));
                } else if (e.deltaY > 0) {
                    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(prev + 0.1, 2)), []);
    const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5)), []);
    const handleZoomReset = useCallback(() => setZoomLevel(1), []);

    return { zoomLevel, handleZoomIn, handleZoomOut, handleZoomReset };
}
