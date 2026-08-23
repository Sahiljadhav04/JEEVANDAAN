import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LocationPicker from '../../components/LocationPicker';
import { useAuth } from '../../context/AuthContext';

// Haversine Distance Formula (KM)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function FindCamps() {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [distanceRadius, setDistanceRadius] = useState('All');
  const [bookingCamp, setBookingCamp] = useState(null);
  const [booked, setBooked] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [myBookedCampIds, setMyBookedCampIds] = useState(new Set()); // track donor's booked camps

  // User location state (default to New Delhi center if no GPS)
  const [userLocation, setUserLocation] = useState({
    location: 'New Delhi, India',
    city: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090
  });


  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    // Load camps
    axios.get('/api/camps').then(r => {
      setCamps(r.data);
      setLoading(false);
    });

    // Load donor's existing bookings to mark "Already Booked" camps
    if (user?.donorId) {
      axios.get(`/api/donor/${user.donorId}/camp-bookings`).then(r => {
        const ids = new Set((r.data || []).map(b => b.camp_id));
        setMyBookedCampIds(ids);
      }).catch(() => {});
    }

    // Try auto GPS detection on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
        },
        () => {},
        { timeout: 5000 }
      );
    }

    // Load Leaflet map
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [user]);


  // Update Leaflet Map when camps or userLocation changes
  useEffect(() => {
    if (!mapLoaded || loading) return;
    const L = window.L;
    const mapElement = document.getElementById('camp-map');
    if (!mapElement) return;

    if (!mapInstanceRef.current) {
      const map = L.map('camp-map').setView([userLocation.lat, userLocation.lng], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // User location marker (Blue Pulsing Pin)
    const userPin = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#2563EB,#3B82F6);border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(37,99,235,0.8);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userPin })
      .addTo(markersGroup)
      .bindPopup(`<strong>Your Location</strong><br>${userLocation.location}`);

    // Camp markers (Red Drop Pins)
    const campPin = L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#C8102E,#FF4D6D);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 10px rgba(200,16,46,0.5)"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    camps.forEach(camp => {
      if (camp.lat && camp.lng) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, camp.lat, camp.lng);
        const marker = L.marker([camp.lat, camp.lng], { icon: campPin })
          .addTo(markersGroup)
          .bindPopup(`
            <div style="font-family:sans-serif;padding:4px;">
              <strong style="color:#C8102E;font-size:14px;">${camp.name}</strong><br>
              <span>📍 ${camp.location} (${dist ? dist + ' km away' : ''})</span><br>
              <span>📅 ${camp.date}</span><br>
              <span>👥 ${camp.bookedSlots}/${camp.slots} slots filled</span>
            </div>
          `);
        
        marker.on('click', () => {
          setSelectedCamp(camp);
          drawRouteToCamp(camp);
        });
      }
    });

  }, [mapLoaded, loading, camps, userLocation]);

  // Draw Leaflet Route Line from User Location to Camp Location
  const drawRouteToCamp = (camp) => {
    if (!mapInstanceRef.current || !camp.lat || !camp.lng) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    const points = [
      [userLocation.lat, userLocation.lng],
      [camp.lat, camp.lng]
    ];

    const polyline = L.polyline(points, {
      color: '#C8102E',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map);

    polylineRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  // Filter camps by Status & Distance
  const filteredCamps = camps.filter(c => {
    const statusMatch = filter === 'All' || c.status === filter;
    if (!statusMatch) return false;

    if (distanceRadius !== 'All' && c.lat && c.lng) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, c.lat, c.lng);
      if (dist !== null && dist > parseFloat(distanceRadius)) return false;
    }
    return true;
  });

  const bookSlot = async (camp) => {
    try {
      await axios.post(`/api/camps/${camp.id}/book`, {
        donorId: user?.donorId || null,
        userId: user?.id || null,
      });
      // Mark this camp as booked in local state immediately
      setMyBookedCampIds(prev => new Set([...prev, camp.id]));
      setBooked(`✅ Slot booked at ${camp.name}! Check your Notifications for confirmation.`);
      setBookingCamp(null);
      axios.get('/api/camps').then(r => setCamps(r.data));
      setTimeout(() => setBooked(''), 5000);
    } catch (err) {
      setBooked(`❌ ${err.response?.data?.error || 'Booking failed'}`);
      setTimeout(() => setBooked(''), 4000);
    }
  };


  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading camps & maps...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">📍 Find Donation Camps</div>
          <div className="section-subtitle">Real-time GPS matching & directions to nearby donation drives</div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowLocationPicker(!showLocationPicker)}
        >
          🎯 {showLocationPicker ? 'Hide Location Control' : 'Change My GPS / Location'}
        </button>
      </div>

      {booked && <div className={`alert ${booked.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>{booked}</div>}

      {/* Location Picker Panel */}
      {showLocationPicker && (
        <div className="card mb-20" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
          <LocationPicker
            location={userLocation.location}
            city={userLocation.city}
            lat={userLocation.lat}
            lng={userLocation.lng}
            label="Set Your Location to Calculate Precise Distance & Directions"
            onChange={(locData) => {
              setUserLocation({
                location: locData.location || userLocation.location,
                city: locData.city || userLocation.city,
                lat: locData.lat,
                lng: locData.lng
              });
            }}
          />
        </div>
      )}

      {/* Interactive Map */}
      <div className="card mb-20">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">🗺️ Live Camp & Route Map</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            📍 Your Pin: Blue Marker | 🩸 Camps: Red Markers
          </span>
        </div>
        <div id="camp-map" style={{ height: '380px', borderRadius: '10px', background: 'var(--bg-elevated)' }}>
          {!mapLoaded && <div className="loading-spinner" style={{ height: '380px' }}><div className="spinner" /><span>Loading Leaflet Map...</span></div>}
        </div>
      </div>

      {/* Filters: Status & Distance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div className="filter-chips" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: 600, alignSelf: 'center', marginRight: '6px' }}>Status:</span>
          {['All', 'Upcoming', 'Completed'].map(f => (
            <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Distance Radius:</span>
          <select
            className="form-select"
            value={distanceRadius}
            onChange={(e) => setDistanceRadius(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}
          >
            <option value="All">All Distances</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
          </select>
        </div>
      </div>

      {/* Camp Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredCamps.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <div className="empty-state-icon">📍</div>
              <div className="empty-state-title">No camps found in this range</div>
              <div className="empty-state-desc">Try increasing the distance radius or changing the status filter</div>
            </div>
          </div>
        ) : (
          filteredCamps.map(camp => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, camp.lat, camp.lng);
            const pct = Math.round((camp.bookedSlots / camp.slots) * 100);
            const isFull = camp.bookedSlots >= camp.slots;
            const isSelected = selectedCamp?.id === camp.id;

            return (
              <div
                key={camp.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--blood-red)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? 'var(--shadow-red)' : 'var(--shadow-card)'
                }}
                onClick={() => {
                  setSelectedCamp(camp);
                  drawRouteToCamp(camp);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{camp.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📅 {camp.date}</div>
                  </div>
                  <span className={`badge ${camp.status === 'Upcoming' ? 'badge-green' : 'badge-gray'}`}>{camp.status}</span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
                  <div>📍 {camp.location}</div>
                  {dist !== null && <div style={{ color: 'var(--blood-red)', fontWeight: 600 }}>📏 Distance: {dist} km away</div>}
                  <div>🏥 Organizer: {camp.organizer}</div>
                  <div>📞 Contact: {camp.contact}</div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Slots Booked</span>
                    <span>{camp.bookedSlots}/{camp.slots} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill red" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {camp.status === 'Upcoming' && (() => {
                    const alreadyBooked = myBookedCampIds.has(camp.id);
                    return alreadyBooked ? (
                      <span className="badge badge-green" style={{ padding: '8px 14px', fontSize: '12px' }}>
                        ✅ Slot Booked
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isFull}
                        onClick={e => { e.stopPropagation(); setBookingCamp(camp); }}
                      >
                        {isFull ? '❌ Full' : '📅 Book Slot'}
                      </button>
                    );
                  })()}

                  {/* Directions Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${camp.lat},${camp.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🗺️ Get Directions
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Modal */}
      {bookingCamp && (
        <div className="modal-overlay" onClick={() => setBookingCamp(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📅 Book Donation Slot</div>
              <button className="close-btn" onClick={() => setBookingCamp(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{bookingCamp.name}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div>📅 Date: {bookingCamp.date}</div>
                  <div>📍 Venue: {bookingCamp.location}</div>
                  <div>🏥 Organizer: {bookingCamp.organizer}</div>
                  <div>👥 Available Slots: {bookingCamp.slots - bookingCamp.bookedSlots} remaining</div>
                </div>
              </div>
              <div className="alert alert-info">ℹ️ Please ensure you have had a nutritious meal and drink plenty of water prior to donation.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setBookingCamp(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => bookSlot(bookingCamp)}>✅ Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
