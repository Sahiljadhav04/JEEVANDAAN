import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable LocationPicker Component
 * Flowchart implementation:
 * Form (Donor/Hospital/Camp) -> LocationPicker -> [GPS / Manual Input] -> Lat+Lng -> Leaflet Map Preview
 */
export default function LocationPicker({
  location = '',
  city = '',
  lat = 28.6139,
  lng = 77.2090,
  onChange = () => {},
  label = 'Location & Address'
}) {
  const [address, setAddress] = useState(location);
  const [cityName, setCityName] = useState(city);
  const [coords, setCoords] = useState({ lat: lat || 28.6139, lng: lng || 77.2090 });
  const [loadingGps, setLoadingGps] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Synchronize initial values
  useEffect(() => {
    if (location && location !== address) setAddress(location);
    if (city && city !== cityName) setCityName(city);
    if (lat && lng && (lat !== coords.lat || lng !== coords.lng)) {
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  }, [location, city, lat, lng]);

  // Load Leaflet map script dynamically if not present
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const customPin = L.divIcon({
        className: 'custom-pin',
        html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#C8102E,#FF4D6D);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 10px rgba(200,16,46,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([coords.lat, coords.lng], { draggable: true, icon: customPin }).addTo(map);
      
      marker.on('dragend', async (e) => {
        const newPos = e.target.getLatLng();
        handleNewCoordinates(newPos.lat, newPos.lng, true);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handleNewCoordinates(e.latlng.lat, e.latlng.lng, true);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }
  }, [mapLoaded, coords.lat, coords.lng]);

  // Reverse geocoding helper (Lat/Lng -> Address string)
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data && data.display_name) {
        const detectedAddress = data.display_name;
        const detectedCity = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || '';
        return { address: detectedAddress, city: detectedCity };
      }
    } catch (err) {
      console.warn('Reverse geocode failed, using fallback coordinates string', err);
    }
    return null;
  };

  // Forward geocoding helper (Address string -> Lat/Lng)
  const forwardGeocode = async (searchQuery) => {
    if (!searchQuery) return;
    setSearching(true);
    setErrorMsg('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        const detectedCity = data[0].display_name.split(',')[0] || '';
        handleNewCoordinates(newLat, newLng, false, searchQuery, detectedCity);
      } else {
        setErrorMsg('Location not found on map. Try entering city name or use GPS button.');
      }
    } catch (err) {
      setErrorMsg('Address lookup failed. Check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleNewCoordinates = async (newLat, newLng, shouldReverseGeocode = false, customAddress = '', customCity = '') => {
    setCoords({ lat: newLat, lng: newLng });
    let finalAddress = customAddress || address;
    let finalCity = customCity || cityName;

    if (shouldReverseGeocode) {
      const geoResult = await reverseGeocode(newLat, newLng);
      if (geoResult) {
        finalAddress = geoResult.address;
        finalCity = geoResult.city || finalCity;
        setAddress(finalAddress);
        setCityName(finalCity);
      }
    }

    onChange({
      location: finalAddress,
      city: finalCity,
      lat: newLat,
      lng: newLng
    });
  };

  // Get User GPS location via navigator.geolocation
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingGps(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        await handleNewCoordinates(userLat, userLng, true);
        setLoadingGps(false);
      },
      (err) => {
        setLoadingGps(false);
        setErrorMsg('GPS access denied or unavailable. Please enter location manually below.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="form-group" style={{ marginBottom: '20px' }}>
      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📍 {label}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drag pin or click map to pinpoint</span>
      </label>

      {/* GPS & Search Control Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn"
          onClick={handleUseGPS}
          disabled={loadingGps}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            fontSize: '12px',
            padding: '8px 14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {loadingGps ? '⏳ Detecting GPS...' : '🎯 Use Current GPS Location'}
        </button>

        <div style={{ flex: 1, display: 'flex', gap: '6px', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type city or area address..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onChange({ location: e.target.value, city: cityName, lat: coords.lat, lng: coords.lng });
            }}
            style={{ fontSize: '13px' }}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => forwardGeocode(address)}
            disabled={searching || !address}
          >
            {searching ? '⏳ Searching...' : '🔍 Locate'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-warning mb-12" style={{ padding: '8px 12px', fontSize: '12px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Interactive Map */}
      <div
        ref={mapContainerRef}
        style={{
          height: '200px',
          width: '100%',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          backgroundColor: '#e5e7eb'
        }}
      />

      {/* Coords & Details Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        <span>{cityName ? `City: ${cityName}` : 'Click map to update address'}</span>
      </div>
    </div>
  );
}
