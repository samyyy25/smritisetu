import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Home,
  Heart,
  ShoppingBag,
  Building,
  Activity,
  Compass,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Map as MapIcon,
  X,
  Check,
  Eye,
  User,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import L from 'leaflet';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../../config';
import { SavedPlace } from '../MyPlacesScreen';
import { StatusBadge } from '../../components/design-system/StatusBadge';

interface LocationLog {
  id: string;
  patientId: string;
  savedPlaceId?: string | null;
  latitude: number;
  longitude: number;
  timestamp: string;
  placeLabel?: string;
  category?: string;
}

interface PatientSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  preferredLanguage: string;
  status: 'Stable' | 'Monitor' | 'Attention';
}

interface DashboardLocationProps {
  onBackToOverview?: () => void;
  onBackToPatients?: () => void;
  patientId?: string;
  onSelectPatient?: (patientId: string) => void;
}

const CATEGORIES = ['Home', 'Family', 'Shop', 'Worship', 'Clinic', 'Other'] as const;

export const DashboardLocation: React.FC<DashboardLocationProps> = ({
  onBackToOverview,
  onBackToPatients,
  patientId = DEMO_PATIENT_ID,
  onSelectPatient,
}) => {
  const [currentPatientId, setCurrentPatientId] = useState<string>(patientId);
  const [patientList, setPatientList] = useState<PatientSummary[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientSummary | null>(null);

  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State for Place Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formCategory, setFormCategory] = useState<typeof CATEGORIES[number]>('Other');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('26.1820');
  const [formLng, setFormLng] = useState('91.7485');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Leaflet map refs for history overview
  const historyMapRef = useRef<HTMLDivElement | null>(null);
  const historyMapInstanceRef = useRef<L.Map | null>(null);
  const historyMarkersRef = useRef<L.Marker[]>([]);
  const historyPathRef = useRef<L.Polyline | null>(null);

  // Modal map picker refs
  const modalMapRef = useRef<HTMLDivElement | null>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);
  const modalPickerMarkerRef = useRef<L.Marker | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (patientId && patientId !== currentPatientId) {
      setCurrentPatientId(patientId);
    }
  }, [patientId]);

  // Fetch patient registry for patient switcher dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.patients)) {
            setPatientList(data.patients);
          }
        }
      } catch (err) {
        console.warn('[DashboardLocation] Failed to fetch patient registry:', err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch current patient profile, places & location logs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientRes, placesRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/patients/${currentPatientId}`),
        fetch(`${API_BASE_URL}/api/patients/${currentPatientId}/places`),
        fetch(`${API_BASE_URL}/api/patients/${currentPatientId}/location-logs`),
      ]);

      if (patientRes.ok) {
        const pData = await patientRes.json();
        setCurrentPatient(pData);
      } else {
        // Fallback info from list
        const found = patientList.find((p) => p.id === currentPatientId);
        if (found) setCurrentPatient(found);
      }

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        setPlaces(Array.isArray(placesData) ? placesData : []);
      } else {
        setPlaces([]);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn('[DashboardLocation] Failed to load location data from API:', err);
      setPlaces([]);
      setLogs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPatientId]);

  // Handle patient switch from dropdown
  const handleSwitchPatient = (newPatientId: string) => {
    setCurrentPatientId(newPatientId);
    onSelectPatient?.(newPatientId);
  };

  // Render Read-Only History Map (strict patientId isolation)
  useEffect(() => {
    if (!historyMapRef.current) return;

    if (!historyMapInstanceRef.current) {
      const map = L.map(historyMapRef.current, {
        center: [26.1820, 91.7485],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      historyMapInstanceRef.current = map;
    }

    const map = historyMapInstanceRef.current;

    // Clear old markers & lines completely
    historyMarkersRef.current.forEach((m) => m.remove());
    historyMarkersRef.current = [];
    if (historyPathRef.current) {
      historyPathRef.current.remove();
      historyPathRef.current = null;
    }

    const allPoints: [number, number][] = [];

    // Add Saved Places Markers for currently selected patient only
    places.forEach((p) => {
      allPoints.push([p.latitude, p.longitude]);

      const placePin = L.divIcon({
        className: 'custom-place-pin',
        html: `<div style="background-color: ${
          p.category === 'Home'
            ? '#0D5C4D'
            : p.category === 'Family'
            ? '#E11D48'
            : p.category === 'Worship'
            ? '#D97706'
            : p.category === 'Clinic'
            ? '#2563EB'
            : p.category === 'Shop'
            ? '#E05345'
            : '#7C3AED'
        }; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          ${p.category === 'Home' ? '🏠' : p.category === 'Family' ? '❤️' : p.category === 'Worship' ? '🛕' : p.category === 'Clinic' ? '🏥' : p.category === 'Shop' ? '🛍️' : '📍'}
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const m = L.marker([p.latitude, p.longitude], { icon: placePin })
        .addTo(map)
        .bindPopup(`<b>${p.label}</b><br/><span style="color:#64748b; font-size:11px;">${p.address || p.category}</span>`);

      historyMarkersRef.current.push(m);
    });

    // Add Read-Only Location Snapshot Points for currently selected patient only
    const logPoints: [number, number][] = [];
    logs.forEach((log, idx) => {
      logPoints.push([log.latitude, log.longitude]);
      allPoints.push([log.latitude, log.longitude]);

      const logPin = L.divIcon({
        className: 'location-log-pin',
        html: `<div style="background-color: ${idx === 0 ? '#10B981' : '#334155'}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
          ${idx + 1}
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const m = L.marker([log.latitude, log.longitude], { icon: logPin })
        .addTo(map)
        .bindPopup(
          `<b>Location Snapshot #${idx + 1}</b><br/><span style="font-size:11px; color:#475569;">${dateStr}</span><br/><span style="color:#0D5C4D; font-weight:bold; font-size:11px;">${
            log.placeLabel ? `Near ${log.placeLabel}` : 'On the move'
          }</span>`
        );

      historyMarkersRef.current.push(m);
    });

    // Draw connecting sequence trail if multiple points exist
    if (logPoints.length > 1) {
      historyPathRef.current = L.polyline(logPoints, {
        color: '#64748B',
        weight: 3,
        opacity: 0.6,
        dashArray: '6, 8',
      }).addTo(map);
    }

    // Smart pan/zoom onto the selected patient's points
    if (allPoints.length > 1) {
      map.fitBounds(allPoints, { padding: [40, 40], maxZoom: 15 });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 15);
    } else {
      map.setView([26.1820, 91.7485], 13);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [places, logs, loading, currentPatientId]);

  // Open Add/Edit Place Modal with Interactive Map Picker
  const handleOpenAddModal = (place?: SavedPlace) => {
    if (place) {
      setEditingPlaceId(place.id);
      setFormLabel(place.label);
      setFormCategory(place.category);
      setFormAddress(place.address || '');
      setFormLat(place.latitude.toString());
      setFormLng(place.longitude.toString());
    } else {
      setEditingPlaceId(null);
      setFormLabel('');
      setFormCategory('Other');
      setFormAddress('');
      setFormLat('26.1820');
      setFormLng('91.7485');
    }
    setIsModalOpen(true);

    setTimeout(() => {
      if (!modalMapRef.current) return;

      const initialLat = place ? place.latitude : 26.1820;
      const initialLng = place ? place.longitude : 91.7485;

      if (!modalMapInstanceRef.current) {
        const pickerMap = L.map(modalMapRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(pickerMap);

        const pin = L.marker([initialLat, initialLng], {
          draggable: true,
        }).addTo(pickerMap);

        pin.on('dragend', () => {
          const pos = pin.getLatLng();
          setFormLat(pos.lat.toFixed(6));
          setFormLng(pos.lng.toFixed(6));
        });

        pickerMap.on('click', (e: L.LeafletMouseEvent) => {
          pin.setLatLng(e.latlng);
          setFormLat(e.latlng.lat.toFixed(6));
          setFormLng(e.latlng.lng.toFixed(6));
        });

        modalPickerMarkerRef.current = pin;
        modalMapInstanceRef.current = pickerMap;
      } else {
        const pickerMap = modalMapInstanceRef.current;
        pickerMap.setView([initialLat, initialLng], 15);
        if (modalPickerMarkerRef.current) {
          modalPickerMarkerRef.current.setLatLng([initialLat, initialLng]);
        }
        pickerMap.invalidateSize();
      }
    }, 250);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;

    setIsSubmitting(true);
    const placePayload = {
      patientId: currentPatientId,
      label: formLabel.trim(),
      category: formCategory,
      address: formAddress.trim() || null,
      latitude: parseFloat(formLat) || 26.1820,
      longitude: parseFloat(formLng) || 91.7485,
      iconType:
        formCategory === 'Home'
          ? 'home'
          : formCategory === 'Family'
          ? 'heart'
          : formCategory === 'Shop'
          ? 'shopping-bag'
          : formCategory === 'Worship'
          ? 'building'
          : formCategory === 'Clinic'
          ? 'activity'
          : 'map-pin',
    };

    try {
      if (editingPlaceId) {
        const res = await fetch(`${API_BASE_URL}/api/places/${editingPlaceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placePayload),
        });

        if (res.ok) {
          const updated = await res.json();
          setPlaces((prev) => prev.map((p) => (p.id === editingPlaceId ? updated : p)));
          setFeedbackMsg({ type: 'success', text: `Place "${updated.label}" updated successfully.` });
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/patients/${currentPatientId}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placePayload),
        });

        if (res.ok) {
          const created = await res.json();
          setPlaces((prev) => [...prev, created]);
          setFeedbackMsg({ type: 'success', text: `Place "${created.label}" added.` });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving place:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to save place.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleDeletePlace = async (id: string, label: string) => {
    if (!window.confirm(`Are you sure you want to remove "${label}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/places/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        setFeedbackMsg({ type: 'success', text: `Place "${label}" removed.` });
      }
    } catch (err) {
      console.error('Error deleting place:', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to delete place.' });
    } finally {
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Trigger simulated periodic snapshot check-in for current patient
  const handleSimulateSnapshot = async () => {
    setIsRefreshing(true);
    const samplePlace = places[Math.floor(Math.random() * places.length)];
    const offsetLat = samplePlace ? samplePlace.latitude + (Math.random() - 0.5) * 0.001 : 26.1820;
    const offsetLng = samplePlace ? samplePlace.longitude + (Math.random() - 0.5) * 0.001 : 91.7485;

    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${currentPatientId}/location-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: offsetLat,
          longitude: offsetLng,
        }),
      });
      if (res.ok) {
        const newLog = await res.json();
        setLogs((prev) => [newLog, ...prev]);
        setFeedbackMsg({ type: 'success', text: `Recorded location snapshot for ${patientDisplayName}.` });
      }
    } catch (err) {
      console.error('Error recording snapshot:', err);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const patientDisplayName = currentPatient?.name || (patientList.find((p) => p.id === currentPatientId)?.name ?? 'Anita Devi');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header with Breadcrumb & Patient Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Navigation Breadcrumbs */}
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500 mb-1.5">
            {onBackToPatients && (
              <button
                type="button"
                onClick={onBackToPatients}
                className="flex items-center space-x-1 text-teal-800 hover:text-teal-950 font-bold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Patients Registry</span>
              </button>
            )}
            {onBackToOverview && !onBackToPatients && (
              <button
                type="button"
                onClick={onBackToOverview}
                className="flex items-center space-x-1 text-teal-800 hover:text-teal-950 font-bold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            )}
            <span>•</span>
            <span className="text-teal-700 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Location Monitoring</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit'] tracking-tight">
            {patientDisplayName} — Location History & Safe Places
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Viewing isolated location history and safe destination coordinates for <strong className="text-slate-800">{patientDisplayName}</strong>.
          </p>
        </div>

        {/* Right Header Actions: Patient Switcher Dropdown & Add Place */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={currentPatientId}
              onChange={(e) => handleSwitchPatient(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition"
              title="Select which patient's location to inspect"
            >
              {patientList.length > 0 ? (
                patientList.map((p) => (
                  <option key={p.id} value={p.id}>
                    👤 {p.name} ({p.preferredLanguage}) — {p.status}
                  </option>
                ))
              ) : (
                <option value={currentPatientId}>👤 {patientDisplayName}</option>
              )}
            </select>
            <User className="w-4 h-4 text-teal-700 absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleSimulateSnapshot}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            title={`Log an on-demand periodic location snapshot for ${patientDisplayName}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Recording...' : 'Simulate Snapshot'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#09473B] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Saved Place</span>
          </button>
        </div>
      </div>

      {/* Upfront Honest Disclaimer Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 flex items-start space-x-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#0D5C4D] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700">
          <h4 className="font-bold text-slate-900">
            Single-Patient Privacy-Preserving View
          </h4>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            Showing location snapshots and safe zones exclusively for <strong>{patientDisplayName}</strong>.
            This is <strong>not continuous live GPS surveillance</strong>. Snapshots are recorded when {patientDisplayName} opens the app or upon on-demand check-in.
          </p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Patient-Specific Map + Places Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Read-Only History Map & Visit History List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-4 h-4 text-[#0D5C4D]" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                  {patientDisplayName}'s Safe Zones & Location History
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Guwahati, Assam
              </span>
            </div>

            {/* Read-Only Map Canvas */}
            <div className="w-full h-80 relative bg-slate-100">
              <div ref={historyMapRef} className="w-full h-full" />
            </div>

            {/* Map Legend */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#0D5C4D]" />
                  <span>Saved Places ({places.length})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Latest Point</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-600" />
                  <span>Past Points</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {logs.length} snapshots recorded for {patientDisplayName}
              </span>
            </div>
          </div>

          {/* Chronological Visit Log List: "Visited [Place Name] at [time]" */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#0D5C4D]" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                  Recent Place Visit History — {patientDisplayName}
                </h3>
              </div>
              <span className="text-xs text-slate-400">Chronological</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="py-8 text-center space-y-1.5">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No location snapshots recorded yet for {patientDisplayName}.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Snapshots are generated automatically when {patientDisplayName} opens the patient app or upon simulated check-in.
                  </p>
                </div>
              ) : (
                logs.map((log, idx) => {
                  const date = new Date(log.timestamp);
                  const formattedTime = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const formattedDate = date.toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={log.id || idx}
                      className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors rounded-xl px-2"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 mt-0.5 ${
                            idx === 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {log.placeLabel ? (
                              <span>Visited <strong className="text-teal-900">{log.placeLabel}</strong></span>
                            ) : (
                              <span>Snapshot check-in (coordinates logged)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Lat: {log.latitude.toFixed(4)}, Lng: {log.longitude.toFixed(4)}
                            {log.category && ` • Category: ${log.category}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-semibold text-slate-700 block">
                          {formattedTime}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manage Saved Places List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-[#0D5C4D]" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                  Manage Saved Destinations ({places.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                {patientDisplayName}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Caregivers can configure and update safe destinations for <strong>{patientDisplayName}'s</strong> "My Places" navigation screen.
            </p>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {places.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No saved destinations configured for {patientDisplayName} yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal()}
                    className="px-3.5 py-2 bg-[#0D5C4D] hover:bg-[#07382E] text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    Add {patientDisplayName}'s First Saved Place
                  </button>
                </div>
              ) : (
                places.map((place) => {
                  const isHome = place.category === 'Home';
                  return (
                    <div
                      key={place.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-teal-200 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5 ${
                            isHome
                              ? 'bg-emerald-100 text-[#0D5C4D]'
                              : place.category === 'Family'
                              ? 'bg-rose-100 text-rose-700'
                              : place.category === 'Worship'
                              ? 'bg-amber-100 text-amber-700'
                              : place.category === 'Clinic'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {isHome ? '🏠' : place.category === 'Family' ? '❤️' : place.category === 'Worship' ? '🛕' : place.category === 'Clinic' ? '🏥' : place.category === 'Shop' ? '🛍️' : '📍'}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {place.label}
                            </h4>
                            {isHome && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Primary Home
                              </span>
                            )}
                          </div>
                          {place.address && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {place.address}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(place)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-200/60 transition"
                          title="Edit location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlace(place.id, place.label)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Place Modal with Interactive Coordinate Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#0D5C4D]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingPlaceId ? `Edit Safe Place — ${patientDisplayName}` : `Add Safe Place for ${patientDisplayName}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Place Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home (Panbazar), Priya's House, Sukreswar Mandir"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-xs bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Panbazar Road, Guwahati"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-xs"
                  />
                </div>
              </div>

              {/* Map Coordinate Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pick Location on Map (Drag Pin or Click)
                </label>
                <div className="w-full h-44 rounded-2xl border border-slate-200 overflow-hidden relative">
                  <div ref={modalMapRef} className="w-full h-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Latitude:</span>
                    <input
                      type="text"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Longitude:</span>
                    <input
                      type="text"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingPlaceId ? 'Update Place' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
