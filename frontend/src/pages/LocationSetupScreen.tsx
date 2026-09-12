import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import {
  ArrowLeft,
  MapPin,
  Home,
  Heart,
  ShoppingBag,
  Building,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  Navigation,
  Play,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
  Map,
  Shield
} from 'lucide-react';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';

export interface SavedPlace {
  id: string;
  patientId: string;
  label: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  category: 'Home' | 'Family' | 'Shop' | 'Worship' | 'Clinic' | 'Other';
  iconType?: string | null;
}

const CATEGORY_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    emoji: string;
    icon: React.FC<{ className?: string }>;
    label: string;
  }
> = {
  Home: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    badgeText: 'text-emerald-800',
    emoji: '🏠',
    icon: Home,
    label: 'Home',
  },
  Family: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    badgeText: 'text-rose-800',
    emoji: '❤️',
    icon: Heart,
    label: 'Family',
  },
  Worship: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    badgeText: 'text-amber-800',
    emoji: '🛕',
    icon: Building,
    label: 'Worship',
  },
  Shop: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-800',
    badgeText: 'text-orange-800',
    emoji: '🛍️',
    icon: ShoppingBag,
    label: 'Shop',
  },
  Clinic: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    badgeText: 'text-blue-800',
    emoji: '🏥',
    icon: Activity,
    label: 'Clinic',
  },
  Other: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    badgeText: 'text-purple-800',
    emoji: '📍',
    icon: MapPin,
    label: 'Other',
  },
};

interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);

  // Form inputs
  const [formLabel, setFormLabel] = useState('');
  const [formCategory, setFormCategory] = useState<SavedPlace['category']>('Family');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState<number>(26.1445);
  const [formLng, setFormLng] = useState<number>(91.7362);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Geocoding / Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);

  // Leaflet map picker ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch saved places for DEMO_PATIENT_ID
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/places`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlaces(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch places:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingPlace(null);
    setFormLabel('');
    setFormCategory('Family');
    setFormAddress('');
    // Default to Guwahati city center or first place lat/lng
    const defaultLat = places[0]?.latitude || 26.1445;
    const defaultLng = places[0]?.longitude || 91.7362;
    setFormLat(defaultLat);
    setFormLng(defaultLng);
    setSearchQuery('');
    setSearchResults([]);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (place: SavedPlace) => {
    setEditingPlace(place);
    setFormLabel(place.label);
    setFormCategory(place.category);
    setFormAddress(place.address || '');
    setFormLat(place.latitude);
    setFormLng(place.longitude);
    setSearchQuery('');
    setSearchResults([]);
    setIsModalOpen(true);
  };

  // Delete place
  const handleDeletePlace = async (id: string, label: string) => {
    if (!window.confirm(`Are you sure you want to remove "${label}" from saved places?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/places/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(`Removed "${label}" successfully`);
        fetchPlaces();
      } else {
        showToast('Failed to delete place. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting place.');
    }
  };

  // Quick Set as Home
  const handleSetAsHome = async (place: SavedPlace) => {
    if (place.category === 'Home') return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/places/${place.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'Home', iconType: 'home' }),
      });
      if (res.ok) {
        showToast(`"${place.label}" is now set as the primary Home destination!`);
        fetchPlaces();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update Home destination.');
    }
  };

  // Handle Free Nominatim Geocoding
  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingGeocode(true);
    try {
      const queryParam = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${queryParam}&limit=4`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length === 0) {
          showToast('No locations found for this address. Try typing a landmark or city.');
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      showToast('Could not reach address search service. You can drop pin on map manually.');
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  // Pick Geocode Result
  const handleSelectSearchResult = (result: GeocodeResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setFormLat(lat);
    setFormLng(lng);
    setFormAddress(result.display_name);
    setSearchResults([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Initialize and sync Leaflet Map inside Modal
  useEffect(() => {
    if (!isModalOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    // Small delay to allow modal DOM rendering
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const initialLat = formLat || 26.1445;
      const initialLng = formLng || 91.7362;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom draggable marker
      const pinIcon = L.divIcon({
        className: 'custom-map-picker-pin',
        html: `
          <div style="background-color: #0D5C4D; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white; cursor: grab;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      // Drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setFormLat(parseFloat(pos.lat.toFixed(6)));
        setFormLng(parseFloat(pos.lng.toFixed(6)));
      });

      // Map click event
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setFormLat(parseFloat(lat.toFixed(6)));
        setFormLng(parseFloat(lng.toFixed(6)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isModalOpen]);

  // Form Submit (Save / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      showToast('Please enter a name/label for the place.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      label: formLabel.trim(),
      category: formCategory,
      address: formAddress.trim() || null,
      latitude: formLat,
      longitude: formLng,
      iconType: formCategory === 'Home' ? 'home' : formCategory === 'Family' ? 'heart' : formCategory === 'Shop' ? 'shopping-bag' : 'map-pin',
    };

    try {
      if (editingPlace) {
        // PUT update
        const res = await fetch(`${API_BASE_URL}/api/places/${editingPlace.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast(`Updated "${formLabel}" successfully!`);
          setIsModalOpen(false);
          fetchPlaces();
        } else {
          showToast('Failed to update place. Please check values.');
        }
      } else {
        // POST create
        const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast(`Added "${formLabel}" to saved places!`);
          setIsModalOpen(false);
          fetchPlaces();
        } else {
          showToast('Failed to add place. Please check values.');
        }
      }
    } catch (err) {
      console.error('Error saving place:', err);
      showToast('Network error while saving place.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentHome = places.find((p) => p.category === 'Home');

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-slate-800">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-slate-700 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#07382E] text-white pt-8 pb-6 px-4 sm:px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigate('/more')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to More</span>
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Caregiver Configuration
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-400/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>My Places Setup</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                Manage safe destinations, GPS coordinates, and primary Home address for Anita Devi
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/places')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#07382E] font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Preview Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Summary & Action Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Safe Destinations
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {places.length} Saved Places
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {currentHome ? (
                <>
                  <span className="font-semibold text-emerald-700">🏠 Home address:</span>{' '}
                  <span className="font-medium text-slate-800">{currentHome.label}</span>{' '}
                  {currentHome.address && <span className="text-slate-400">({currentHome.address})</span>}
                </>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" /> No Home address set yet. Mark one destination as Home for "Take Me Home" navigation.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#09473b] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Place</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/places')}
              className="sm:hidden inline-flex items-center justify-center p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
              title="Preview Map"
            >
              <Play className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Places List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Locations for Anita Devi
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Synchronized with Patient App Map
            </span>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#0D5C4D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading saved places...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">No Saved Places Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Add Anita Devi's Home, family residences, favorite shop, temple, or local clinic to help her navigate safely.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5C4D] text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Place</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {places.map((place) => {
                const config = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.Other;
                const IconComponent = config.icon;
                const isHome = place.category === 'Home';

                return (
                  <div
                    key={place.id}
                    className={`bg-white rounded-3xl p-4 border transition-all ${
                      isHome
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold shadow-xs ${
                            isHome ? 'bg-[#0D5C4D] text-white' : `${config.bg} ${config.text}`
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {place.label}
                            </h3>
                            {isHome && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🏠 Primary Home
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg}`}
                            >
                              {config.emoji} {place.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {place.address || 'Address not specified'}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
                            <Compass className="w-3 h-3 text-slate-400" />
                            <span>
                              {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      <div>
                        {!isHome ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsHome(place)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Make this the Home destination"
                          >
                            <Home className="w-3 h-3 text-emerald-600" />
                            <span>Set as Home</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-lg">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Take Me Home Target</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(place)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlace(place.id, place.label)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete place"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Information Guide Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-5 border border-emerald-200/60 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#0D5C4D] font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Navigation & Caregiver Safety Features</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>
              <strong className="text-slate-800">Single Home Destination:</strong> Setting a place as "Home" ensures that tapping the green <em>"Take Me Home"</em> button on the patient map routes directly to this address.
            </li>
            <li>
              <strong className="text-slate-800">Visual Category Pins:</strong> Each category is assigned a distinct icon and color for quick landmark recognition by elderly patients.
            </li>
            <li>
              <strong className="text-slate-800">Real-Time Sync:</strong> Any updates made here take effect immediately in the Patient App's map view without requiring app restart.
            </li>
          </ul>
        </div>
      </div>

      {/* Add / Edit Place Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  {editingPlace ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingPlace ? 'Edit Saved Place' : 'Add New Saved Place'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure name, category, and coordinate pin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Place Name / Label */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Place Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Home (Beltola), Daughter's House, Sunday Market"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] focus:border-transparent font-medium"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] focus:border-transparent font-medium bg-white"
                >
                  <option value="Home">🏠 Home (Primary Take Me Home Destination)</option>
                  <option value="Family">❤️ Family (Children / Relatives Residence)</option>
                  <option value="Shop">🛍️ Shop (Grocery, Market, Pharmacy)</option>
                  <option value="Worship">🛕 Worship (Temple, Naamghar, Church, Mosque)</option>
                  <option value="Clinic">🏥 Clinic (Health Center, Hospital)</option>
                  <option value="Other">📍 Other (Park, Community Center)</option>
                </select>

                {formCategory === 'Home' && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-2 font-medium">
                    ℹ️ Setting this place as <strong>Home</strong> will replace any previous Home designation, as the patient app relies on exactly one primary Home destination for one-tap navigation.
                  </p>
                )}
              </div>

              {/* Address Search / Geocoding */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Search Address or Landmark (Free OpenStreetMap Geocoding)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Beltola Tiniali, Guwahati, Six Mile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchAddress();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchAddress()}
                    disabled={isSearchingGeocode || !searchQuery.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isSearchingGeocode ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Search</span>
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs shadow-md">
                    {searchResults.map((res, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full p-2.5 text-left hover:bg-emerald-50 transition-colors flex items-start gap-2 text-slate-700"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{res.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., House No. 12, Beltola Tiniali, Guwahati, Assam 781028"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              {/* Interactive Map Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Map className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pinpoint on Map (Tap or Drag Marker)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formLat.toFixed(4)}°, {formLng.toFixed(4)}°
                  </span>
                </div>
                <div
                  ref={mapContainerRef}
                  className="w-full h-48 sm:h-52 rounded-2xl border border-slate-300 overflow-hidden shadow-inner relative z-0"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 Tap anywhere on the map or drag the green pin to position this place precisely.
                </p>
              </div>

              {/* Exact Lat/Lng inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0D5C4D] hover:bg-[#09473b] text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingPlace ? 'Update Place' : 'Save New Place'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNavBar activeTab="more" onTabChange={(tab: NavTabId) => {
        if (tab === 'home') navigate('/patient/home');
        else if (tab === 'games') navigate('/games');
        else navigate(`/${tab}`);
      }} />
    </div>
  );
};

export default LocationSetupScreen;
