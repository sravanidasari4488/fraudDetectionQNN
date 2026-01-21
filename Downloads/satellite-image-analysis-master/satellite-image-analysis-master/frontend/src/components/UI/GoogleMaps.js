import React, { useEffect, useRef, useState } from 'react';

/**
 * Google Maps Component for Reference Imagery Visualization
 * 
 * STRICT: This component is for VISUALIZATION ONLY.
 * It does NOT use Google Maps data for analysis or statistics.
 */
const GoogleMaps = ({ lat, lon, localityName = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Google Maps API is loaded
  const isGoogleMapsLoaded = () => {
    return typeof window !== 'undefined' && window.google && window.google.maps;
  };

  // Load Google Maps script if not already loaded
  useEffect(() => {
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Debug: log to console (remove in production)
    console.log('Google Maps API Key check:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey || apiKey.trim() === '') {
      setMapError('Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file and restart the development server.');
      setIsLoading(false);
      return;
    }

    // Check if script is already loaded
    if (isGoogleMapsLoaded()) {
      setIsLoading(false);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for script to load
      existingScript.addEventListener('load', () => {
        setIsLoading(false);
      });
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps. Please check your API key and network connection.');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  // Initialize and render map
  const renderMap = React.useCallback((latitude, longitude) => {
    if (!isGoogleMapsLoaded() || !mapRef.current) {
      return;
    }

    try {
      // Clear existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }

      // Create map instance with HYBRID view (satellite + labels)
      // HYBRID combines satellite imagery with road labels
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.HYBRID, // Satellite view with road labels
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [
            window.google.maps.MapTypeId.HYBRID, // Satellite with labels
            window.google.maps.MapTypeId.SATELLITE, // Pure satellite
            window.google.maps.MapTypeId.ROADMAP // Road map
          ]
        },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true
      });

      // Add marker at the locality location
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: localityName || 'Selected Locality',
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>${localityName || 'Selected Locality'}</strong><br/>
            <small>Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}</small>
          </div>
        `
      });

      markerRef.current.addListener('click', () => {
        infoWindow.open(map, markerRef.current);
      });

      mapInstanceRef.current = map;
      setMapError(null);
    } catch (error) {
      console.error('Error rendering map:', error);
      setMapError('Failed to initialize map. Please try again.');
    }
  }, [localityName]);

  // Render map when coordinates are available
  useEffect(() => {
    if (lat && lon && !isLoading && isGoogleMapsLoaded() && mapRef.current) {
      renderMap(parseFloat(lat), parseFloat(lon));
    }
  }, [lat, lon, isLoading, renderMap]);

  if (mapError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        border: '2px dashed #d1d5db',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Map Unavailable</p>
        <p style={{ fontSize: '12px', color: '#4b5563', textAlign: 'center', maxWidth: '400px' }}>{mapError}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '12px'
          }}></div>
          <p style={{ fontSize: '14px', color: '#4b5563' }}>Loading map...</p>
        </div>
      </div>
    );
  }

  if (!lat || !lon) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        border: '2px dashed #d1d5db'
      }}>
        <p style={{ fontSize: '14px', color: '#4b5563' }}>Enter a location to view satellite imagery</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Reference Imagery Label */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
          Satellite View (Reference Imagery)
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563' }}>
          Source: Google Maps
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          border: '2px solid #e5e7eb',
          minHeight: '400px'
        }}
      />
      
      {/* Add spin animation for loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleMaps;

