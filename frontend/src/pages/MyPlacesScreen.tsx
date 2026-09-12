import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import {
  Home,
  Heart,
  ShoppingBag,
  Building,
  Activity,
  MapPin,
  Navigation,
  Volume2,
  VolumeX,
  Compass,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  LocateFixed,
  ArrowRight,
  Footprints,
  Sparkles,
  Info
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { BigActionCard, PastelTheme } from '../components/design-system/BigActionCard';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../config';
import { SUPPORTED_LANGUAGES } from '../i18n';

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

// Category themes and accessible visual styling
const CATEGORY_CONFIG: Record<
  string,
  {
    theme: PastelTheme;
    pinBg: string;
    pinColor: string;
    emoji: string;
    icon: React.FC<{ className?: string }>;
    defaultLabel: string;
  }
> = {
  Home: {
    theme: 'mint',
    pinBg: '#0D5C4D',
    pinColor: '#FFFFFF',
    emoji: '🏠',
    icon: Home,
    defaultLabel: 'Home',
  },
  Family: {
    theme: 'rose',
    pinBg: '#E11D48',
    pinColor: '#FFFFFF',
    emoji: '❤️',
    icon: Heart,
    defaultLabel: 'Family',
  },
  Worship: {
    theme: 'peach',
    pinBg: '#D97706',
    pinColor: '#FFFFFF',
    emoji: '🛕',
    icon: Building,
    defaultLabel: 'Worship',
  },
  Shop: {
    theme: 'pink',
    pinBg: '#E05345',
    pinColor: '#FFFFFF',
    emoji: '🛍️',
    icon: ShoppingBag,
    defaultLabel: 'Shop',
  },
  Clinic: {
    theme: 'blue',
    pinBg: '#2563EB',
    pinColor: '#FFFFFF',
    emoji: '🏥',
    icon: Activity,
    defaultLabel: 'Clinic',
  },
  Other: {
    theme: 'lavender',
    pinBg: '#7C3AED',
    pinColor: '#FFFFFF',
    emoji: '📍',
    icon: MapPin,
    defaultLabel: 'Other Place',
  },
};

// Fallback places for demo patient Ramesh Sharma in Guwahati
const FALLBACK_PLACES: SavedPlace[] = [
  {
    id: 'plc_home_001',
    patientId: DEMO_PATIENT_ID,
    label: 'Home (Panbazar)',
    latitude: 26.1820,
    longitude: 91.7485,
    address: 'House #14, Hem Baruah Road, Panbazar, Guwahati',
    category: 'Home',
    iconType: 'home',
  },
  {
    id: 'plc_family_002',
    patientId: DEMO_PATIENT_ID,
    label: "Priya's House (Daughter)",
    latitude: 26.1510,
    longitude: 91.7725,
    address: 'Block B-4, Capital View Apartments, Dispur',
    category: 'Family',
    iconType: 'heart',
  },
  {
    id: 'plc_worship_003',
    patientId: DEMO_PATIENT_ID,
    label: 'Community Mandir',
    latitude: 26.1802,
    longitude: 91.7430,
    address: 'Near Nehru Park, Sukreswar Complex, MG Road',
    category: 'Worship',
    iconType: 'building',
  },
  {
    id: 'plc_shop_004',
    patientId: DEMO_PATIENT_ID,
    label: 'Usual Grocery (Bora Brothers)',
    latitude: 26.1795,
    longitude: 91.7510,
    address: 'Shop #12, Panbazar Market Crossroad',
    category: 'Shop',
    iconType: 'shopping-bag',
  },
  {
    id: 'plc_clinic_005',
    patientId: DEMO_PATIENT_ID,
    label: 'Dr. Borah Senior Care Clinic',
    latitude: 26.1840,
    longitude: 91.7420,
    address: 'GNRC Medical Centre Annex, Panbazar',
    category: 'Clinic',
    iconType: 'activity',
  },
];

export const MyPlacesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [places, setPlaces] = useState<SavedPlace[]>(FALLBACK_PLACES);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);
  const [loading, setLoading] = useState(false);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 26.1812, // Default close to home in Panbazar for instant visual wayfinding
    lng: 91.7490,
  });
  const [geoPermissionStatus, setGeoPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'explanation'
  >('explanation');

  const [navigationRoute, setNavigationRoute] = useState<{
    distanceMeters: number;
    estimatedMinutes: number;
    stepList: string[];
    spokenSummary: string;
  } | null>(null);

  // Voice state
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const placeMarkersRef = useRef<L.Marker[]>([]);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Load Saved Places from backend
  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/places`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlaces(data);
          }
        }
      } catch (err) {
        console.warn('Using fallback saved places:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  // Candidate BCP-47 speech language codes
  const getSpeechLangCandidates = (code: string): string[] => {
    switch (code) {
      case 'hi': return ['hi-IN', 'hi'];
      case 'as': return ['as-IN', 'as', 'bn-IN'];
      case 'ne': return ['ne-NP', 'ne-IN', 'ne'];
      case 'kha': return ['kha-IN', 'kha', 'en-IN'];
      case 'miz': return ['lus-IN', 'lus', 'miz-IN', 'en-IN'];
      case 'en':
      default:
        return ['en-IN', 'en-GB', 'en-US', 'en'];
    }
  };

  const findMatchingVoice = (langCode: string): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const candidates = getSpeechLangCandidates(langCode);
    for (const cand of candidates) {
      const candLower = cand.toLowerCase();
      const matched = voices.find((v) => {
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        return vLang === candLower || vLang.startsWith(candLower);
      });
      if (matched) return matched;
    }
    return null;
  };

  // Speak navigation instructions aloud
  const speakDirectionsAloud = useCallback(
    (textToSpeak: string) => {
      if (!('speechSynthesis' in window)) {
        setVoiceNotice('Voice synthesis is not supported on this browser.');
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const matchedVoice = findMatchingVoice(currentLang);

        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }

        utterance.rate = 0.90; // Gentle, clear cadence for elderly users
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeakingLocal(true);
          setVoiceNotice(null);
        };

        utterance.onend = () => {
          setIsSpeakingLocal(false);
        };

        utterance.onerror = () => {
          setIsSpeakingLocal(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsSpeakingLocal(false);
      }
    },
    [currentLang]
  );

  const stopSpeakingDirections = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingLocal(false);
  };

  // Request browser geolocation with friendly pre-permission feedback
  const handleRequestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoPermissionStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newCoords);
        setGeoPermissionStatus('granted');

        // Post on-demand periodic snapshot to backend
        fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/location-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: newCoords.lat,
            longitude: newCoords.lng,
          }),
        }).catch((e) => console.warn('Snapshot log fallback:', e));
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setGeoPermissionStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [26.1820, 91.7485];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap raster tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old place markers
    placeMarkersRef.current.forEach((m) => m.remove());
    placeMarkersRef.current = [];

    // Add Patient Live Marker
    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const pulseIcon = L.divIcon({
          className: 'patient-pulse-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: pulseIcon,
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup('<b>' + t('your_location', 'You are here') + '</b>');
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Add Saved Place Markers
    places.forEach((place) => {
      const cfg = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.Other;
      const isSelected = selectedPlace?.id === place.id;

      const placeIcon = L.divIcon({
        className: 'custom-place-pin',
        html: `<div style="background-color: ${cfg.pinBg}; color: ${cfg.pinColor}; width: ${
          isSelected ? '40px' : '32px'
        }; height: ${isSelected ? '40px' : '32px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${
          isSelected ? '18px' : '14px'
        }; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); transition: all 0.25s;">
          ${cfg.emoji}
        </div>`,
        iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
        iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: placeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #0D5C4D;">${place.label}</strong><br/>
            <span style="color: #64748B; font-size: 11px;">${place.address || place.category}</span>
          </div>`
        );

      marker.on('click', () => {
        handleSelectPlace(place);
      });

      placeMarkersRef.current.push(marker);
    });

    // Update Route Polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (userLocation && selectedPlace) {
      const start: [number, number] = [userLocation.lat, userLocation.lng];
      const end: [number, number] = [selectedPlace.latitude, selectedPlace.longitude];

      const polyline = L.polyline([start, end], {
        color: '#0D5C4D',
        weight: 7,
        opacity: 0.9,
        dashArray: '10, 14',
        lineCap: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;
      map.fitBounds([start, end], { padding: [60, 60], maxZoom: 16 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [places, selectedPlace, userLocation, t]);

  // Generate localized step-by-step guidance
  const generateDirections = (place: SavedPlace, distMeters: number, minutes: number) => {
    const distText = distMeters > 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters} m`;

    let stepList: string[] = [];
    let spokenSummary = '';

    switch (currentLang) {
      case 'hi':
        stepList = [
          `1. अपनी वर्तमान जगह से मुख्य रास्ते पर आगे बढ़ें।`,
          `2. ${place.label} की दिशा में सीधे चलें (दूरी: लगभग ${distText})।`,
          `3. ${place.address ? place.address.split(',')[0] : 'गंतव्य स्थल'} का बोर्ड देखें।`,
          `4. आप सुरक्षित रूप से ${place.label} पहुँच जाएँगे।`,
        ];
        spokenSummary = `${place.label} का रास्ता। दूरी लगभग ${distText} है, पैदल चलने में लगभग ${minutes} मिनट लगेंगे। स्क्रीन पर हरी लाइन के साथ आगे बढ़ें।`;
        break;

      case 'as':
        stepList = [
          `১. আপোনাৰ বৰ্তমান স্থানৰ পৰা মূল বাটটোৰে আগবাঢ়ক।`,
          `২. ${place.label}ৰ দিশে খোজ কাঢ়ক (দূৰত্ব: প্ৰায় ${distText})।`,
          `৩. ${place.address ? place.address.split(',')[0] : 'নিৰ্দিষ্ট স্থান'}ৰ ওচৰলৈ যাওক।`,
          `৪. আপুনি নিৰাপদে ${place.label}ত উপস্থিত হ’ব।`,
        ];
        spokenSummary = `${place.label}লৈ যোৱাৰ বাট। দূৰত্ব প্ৰায় ${distText}, খোজকাঢ়ি যাবলৈ প্ৰায় ${minutes} মিনিট লাগিব।`;
        break;

      case 'ne':
        stepList = [
          `१. तपाईंको अहिलेको ठाउँबाट मुख्य बाटोमा अगाडि बढ्नुहोस्।`,
          `२. ${place.label} तर्फ हिंड्नुहोस् (दूरी: करिब ${distText})।`,
          `३. ${place.address ? place.address.split(',')[0] : 'स्थान'} पत्ता लगाउनुहोस्।`,
          `४. तपाईं सुरक्षित रूपमा ${place.label} पुग्नुहुनेछ।`,
        ];
        spokenSummary = `${place.label}को बाटो। दूरी करिब ${distText} छ, करिब ${minutes} मिनटको पैदल दूरी छ।`;
        break;

      case 'en':
      default:
        stepList = [
          `1. Start from your current spot on the main walkway.`,
          `2. Walk straight towards ${place.label} (${distText} ahead).`,
          `3. Look for ${place.address ? place.address.split(',')[0] : place.label}.`,
          `4. Arrive safely at ${place.label}.`,
        ];
        spokenSummary = `Directions to ${place.label}. Distance is about ${distText}, roughly ${minutes} minutes walk. Follow the green route on your screen.`;
        break;
    }

    return { stepList, spokenSummary };
  };

  // Handle selecting a place and initiating walk navigation
  const handleSelectPlace = (place: SavedPlace) => {
    setSelectedPlace(place);

    if (!userLocation) {
      setNavigationRoute(null);
      return;
    }

    const R = 6371e3;
    const φ1 = (userLocation.lat * Math.PI) / 180;
    const φ2 = (place.latitude * Math.PI) / 180;
    const Δφ = ((place.latitude - userLocation.lat) * Math.PI) / 180;
    const Δλ = ((place.longitude - userLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distMeters = Math.round(R * c);
    const minutes = Math.max(1, Math.round(distMeters / 75));

    const { stepList, spokenSummary } = generateDirections(place, distMeters, minutes);

    setNavigationRoute({
      distanceMeters: distMeters,
      estimatedMinutes: minutes,
      stepList,
      spokenSummary,
    });

    // Automatically speak directions for hands-free reassurance
    speakDirectionsAloud(spokenSummary);
  };

  // "Take Me Home" quick-action handler
  const handleTakeMeHome = () => {
    const homePlace = places.find((p) => p.category === 'Home') || places[0];
    if (homePlace) {
      handleSelectPlace(homePlace);
    }
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  return (
    <MobileContainer headerTitle={t('my_places_title', 'My Places')}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-start">
        
        {/* =========================================================================
            PERSISTENT "TAKE ME HOME" PROMINENT BUTTON (ACTIVE WAYFINDING)
           ========================================================================= */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleTakeMeHome}
            className="w-full bg-gradient-to-r from-[#0D5C4D] via-[#116857] to-[#147260] hover:from-[#09473B] hover:to-[#0D5C4D] text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-emerald-950/20 flex items-center justify-between transition-all duration-200 active:scale-[0.99] border-2 border-emerald-300/40"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#0D5C4D] flex items-center justify-center shadow-md flex-shrink-0">
                <Home className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-200 block">
                  {t('one_tap_safety', 'Emergency / Safe Return')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {t('take_me_home', 'Take Me Home')}
                </h2>
                <p className="text-xs text-emerald-100/90 font-medium">
                  {t('take_me_home_sub', 'Find way back to your Panbazar home')}
                </p>
              </div>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Navigation className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Friendly Pre-permission Explanation Banner */}
        {geoPermissionStatus === 'explanation' && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-start justify-between shadow-xs animate-fadeIn">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-200/70 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {t('enable_location_prompt', 'Location Assistance')}
                </h4>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  {t(
                    'location_explainer_text',
                    'SmritiSetu uses your location to calculate easy directions to your family and temple. We only check your location when you ask.'
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestLiveLocation}
              className="ml-3 px-4 py-2 rounded-2xl bg-[#0D5C4D] hover:bg-[#09473B] text-white font-bold text-xs shadow-xs flex-shrink-0 transition-colors"
            >
              {t('allow_location', 'Allow')}
            </button>
          </div>
        )}

        {/* Graceful Fallback if GPS is Denied/Off */}
        {geoPermissionStatus === 'denied' && (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-700 animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>
                {t(
                  'location_off_notice',
                  'Live GPS is off. You can still see all your saved places and addresses below.'
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRequestLiveLocation}
              className="text-[#0D5C4D] font-bold text-xs underline underline-offset-2 ml-2 flex-shrink-0"
            >
              {t('try_again', 'Retry')}
            </button>
          </div>
        )}

        {/* =========================================================================
            INTERACTIVE LEAFLET MAP SECTION
           ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-card overflow-hidden flex flex-col">
          {/* Map Header Status */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#0D5C4D]" />
              <span className="font-bold text-slate-900 text-sm">
                {selectedPlace
                  ? `${t('navigating_to', 'Walking to:')} ${selectedPlace.label}`
                  : t('your_saved_map', 'Your Safe Destinations Map')}
              </span>
            </div>

            {selectedPlace && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPlace(null);
                  setNavigationRoute(null);
                  stopSpeakingDirections();
                }}
                className="text-xs text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-xl"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('clear_route', 'Clear')}</span>
              </button>
            )}
          </div>

          {/* Leaflet Map Canvas */}
          <div className="relative w-full h-64 sm:h-80">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Recenter Button on Map */}
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current && userLocation) {
                  mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16);
                }
              }}
              className="absolute bottom-3 right-3 z-20 w-11 h-11 rounded-2xl bg-white text-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 border border-slate-200 active:scale-95"
              title="Recenter on my location"
            >
              <LocateFixed className="w-6 h-6 text-[#0D5C4D]" />
            </button>
          </div>

          {/* =========================================================================
              ACTIVE "WALK ME THERE" SIMPLE LARGE-TEXT STEP DIRECTIONS
             ========================================================================= */}
          {selectedPlace && navigationRoute && (
            <div className="p-4 sm:p-5 bg-gradient-to-b from-[#EAF6F4] to-[#F2FAF8] border-t-2 border-[#CEEBE6] space-y-3.5 animate-fadeIn">
              
              {/* Distance & Walking Time Large Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0D5C4D] text-white flex items-center justify-center shadow-xs">
                    <Footprints className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#0D5C4D]">
                      {t('walking_estimate', 'Walking Route')}
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {navigationRoute.estimatedMinutes} {t('minutes_walk', 'mins walk')}
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        (
                        {navigationRoute.distanceMeters > 1000
                          ? `${(navigationRoute.distanceMeters / 1000).toFixed(1)} km`
                          : `${navigationRoute.distanceMeters} m`}
                        )
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Narration Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingLocal) {
                      stopSpeakingDirections();
                    } else {
                      speakDirectionsAloud(navigationRoute.spokenSummary);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isSpeakingLocal
                      ? 'bg-[#0D5C4D] text-white ring-2 ring-emerald-400 animate-pulse'
                      : 'bg-white text-[#0D5C4D] hover:bg-emerald-50 border border-emerald-300'
                  }`}
                >
                  {isSpeakingLocal ? (
                    <>
                      <VolumeX className="w-4 h-4 text-white" />
                      <span>{t('stop_voice', 'Stop Voice')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#0D5C4D]" />
                      <span>{t('hear_directions', 'Hear Out Loud')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Large, Easy-to-Read Step List for Elderly User */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-100/90 shadow-2xs space-y-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Simple Step-by-Step Guide
                </span>
                {navigationRoute.stepList.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-2 rounded-xl bg-slate-50/60 border border-slate-100"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#0D5C4D] font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                      {step.replace(/^\d+\.\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SAVED PLACES LIST (BIG ACTION CARDS - TAP TO NAVIGATE)
           ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('saved_places_heading', 'Saved Places (Tap to Navigate)')}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {places.length} {t('places_count', 'destinations')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {places.map((place) => {
              const cfg = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.Other;
              const Icon = cfg.icon;
              const isSelected = selectedPlace?.id === place.id;

              return (
                <div
                  key={place.id}
                  className={`transition-all rounded-3xl ${
                    isSelected ? 'ring-3 ring-[#0D5C4D] ring-offset-2' : ''
                  }`}
                >
                  <BigActionCard
                    fullWidth
                    theme={cfg.theme}
                    icon={<Icon className="w-8 h-8" />}
                    title={place.label}
                    subtitle={place.address || `${cfg.defaultLabel} Destination`}
                    badgeText={place.category === 'Home' ? 'Primary Home' : undefined}
                    onClick={() => handleSelectPlace(place)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Honest Transparency Note */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-500 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong>{t('privacy_notice_title', 'Prototype Note:')}</strong>{' '}
            {t(
              'privacy_notice_desc',
              'SmritiSetu uses on-demand browser location when opened. It does not perform continuous battery-draining background tracking.'
            )}
          </p>
        </div>

      </div>

      {/* Pinned Bottom Nav */}
      <BottomNavBar activeTab="places" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default MyPlacesScreen;
