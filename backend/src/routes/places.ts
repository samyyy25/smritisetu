import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

export interface SavedPlaceItem {
  id: string;
  patientId: string;
  label: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  category: 'Home' | 'Family' | 'Shop' | 'Worship' | 'Clinic' | 'Other';
  iconType?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LocationLogItem {
  id: string;
  patientId: string;
  savedPlaceId?: string | null;
  latitude: number;
  longitude: number;
  timestamp: string;
  placeLabel?: string;
  category?: string;
}

// Default realistic demo places for Anita Devi in Guwahati, Assam
const DEFAULT_SAVED_PLACES: SavedPlaceItem[] = [
  {
    id: 'plc_home_001',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: 'Home (Panbazar)',
    latitude: 26.1820,
    longitude: 91.7485,
    address: 'House #14, Hem Baruah Road, Panbazar, Guwahati, Assam 781001',
    category: 'Home',
    iconType: 'home',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'plc_family_002',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: "Priya's House (Daughter)",
    latitude: 26.1510,
    longitude: 91.7725,
    address: 'Block B-4, Capital View Apartments, Dispur, Guwahati, Assam 781006',
    category: 'Family',
    iconType: 'heart',
    createdAt: new Date('2024-01-12').toISOString(),
  },
  {
    id: 'plc_worship_003',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: 'Community Mandir',
    latitude: 26.1802,
    longitude: 91.7430,
    address: 'Near Nehru Park, Sukreswar Temple Complex, MG Road, Guwahati',
    category: 'Worship',
    iconType: 'building',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'plc_shop_004',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: 'Usual Grocery Shop (Bora Brothers)',
    latitude: 26.1795,
    longitude: 91.7510,
    address: 'Shop #12, Panbazar Market Crossroad, Guwahati',
    category: 'Shop',
    iconType: 'shopping-bag',
    createdAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'plc_clinic_005',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: 'Dr. Borah Senior Care Clinic & Pharmacy',
    latitude: 26.1840,
    longitude: 91.7420,
    address: 'GNRC Medical Centre Annex, Panbazar, Guwahati',
    category: 'Clinic',
    iconType: 'activity',
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'plc_other_006',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    label: 'Dighalipukhuri Lake Walkway',
    latitude: 26.1870,
    longitude: 91.7530,
    address: 'North Lake Road, Ambari, Guwahati',
    category: 'Other',
    iconType: 'map-pin',
    createdAt: new Date('2024-02-05').toISOString(),
  },
];

// Default sample periodic location logs
const DEFAULT_LOCATION_LOGS: LocationLogItem[] = [
  {
    id: 'log_001',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    savedPlaceId: 'plc_home_001',
    latitude: 26.18205,
    longitude: 91.74848,
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
    placeLabel: 'Home (Panbazar)',
    category: 'Home',
  },
  {
    id: 'log_002',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    savedPlaceId: 'plc_shop_004',
    latitude: 26.17955,
    longitude: 91.75102,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(), // 3.5 hours ago
    placeLabel: 'Usual Grocery Shop (Bora Brothers)',
    category: 'Shop',
  },
  {
    id: 'log_003',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    savedPlaceId: 'plc_other_006',
    latitude: 26.18702,
    longitude: 91.75305,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // Yesterday evening
    placeLabel: 'Dighalipukhuri Lake Walkway',
    category: 'Other',
  },
  {
    id: 'log_004',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    savedPlaceId: 'plc_worship_003',
    latitude: 26.18021,
    longitude: 91.74304,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday morning
    placeLabel: 'Community Mandir',
    category: 'Worship',
  },
  {
    id: 'log_005',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    savedPlaceId: 'plc_family_002',
    latitude: 26.15104,
    longitude: 91.77248,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2 days ago
    placeLabel: "Priya's House (Daughter)",
    category: 'Family',
  },
];

let inMemoryPlaces = [...DEFAULT_SAVED_PLACES];
let inMemoryLogs = [...DEFAULT_LOCATION_LOGS];

/**
 * Haversine formula to compute distance in meters between two lat/lng points
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * GET /api/patients/:patientId/places
 * List all saved places for a specific patient
 */
router.get('/patients/:patientId/places', async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const places = await (prisma as any).savedPlace?.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
    });

    if (places !== undefined && places !== null) {
      res.json(places);
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${patientId}/places] Fallback due to:`, (err as any)?.message);
  }

  // Fallback in-memory places strictly filtered by patientId
  const filtered = inMemoryPlaces.filter((p) => p.patientId === patientId);
  res.json(filtered);
});

/**
 * POST /api/patients/:patientId/places
 * Add a new saved place
 */
router.post('/patients/:patientId/places', async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params;
  const { label, latitude, longitude, address, category, iconType } = req.body;

  if (!label || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'Missing required fields: label, latitude, longitude' });
    return;
  }

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const validCategory = category || 'Other';
  const validIcon = iconType || (validCategory === 'Home' ? 'home' : validCategory === 'Family' ? 'heart' : 'map-pin');

  if (validCategory === 'Home') {
    try {
      await (prisma as any).savedPlace?.updateMany({
        where: { patientId, category: 'Home' },
        data: { category: 'Other' }
      });
    } catch (e) {
      console.warn('Error resetting previous home in DB:', e);
    }
    inMemoryPlaces = inMemoryPlaces.map(p => p.patientId === patientId && p.category === 'Home' ? { ...p, category: 'Other' } : p);
  }

  try {
    const created = await (prisma as any).savedPlace?.create({
      data: {
        patientId,
        label,
        latitude: parsedLat,
        longitude: parsedLng,
        address: address || null,
        category: validCategory,
        iconType: validIcon,
      },
    });

    if (created) {
      res.status(201).json(created);
      return;
    }
  } catch (err) {
    console.warn(`[POST /api/patients/${patientId}/places] Database error, saving in-memory:`, (err as any)?.message);
  }

  const newPlace: SavedPlaceItem = {
    id: `plc_${Date.now()}`,
    patientId,
    label,
    latitude: parsedLat,
    longitude: parsedLng,
    address: address || '',
    category: validCategory,
    iconType: validIcon,
    createdAt: new Date().toISOString(),
  };

  inMemoryPlaces.push(newPlace);
  res.status(201).json(newPlace);
});

/**
 * PUT /api/places/:id
 * Update an existing saved place
 */
router.put('/places/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { label, latitude, longitude, address, category, iconType } = req.body;

  if (category === 'Home') {
    try {
      const existing = await (prisma as any).savedPlace?.findUnique({ where: { id } });
      if (existing?.patientId) {
        await (prisma as any).savedPlace?.updateMany({
          where: { patientId: existing.patientId, category: 'Home', NOT: { id } },
          data: { category: 'Other' }
        });
      }
    } catch (e) {
      console.warn('Error resetting previous home in DB on update:', e);
    }
    const memExisting = inMemoryPlaces.find(p => p.id === id);
    if (memExisting) {
      inMemoryPlaces = inMemoryPlaces.map(p => p.patientId === memExisting.patientId && p.id !== id && p.category === 'Home' ? { ...p, category: 'Other' } : p);
    }
  }

  try {
    const updated = await (prisma as any).savedPlace?.update({
      where: { id },
      data: {
        ...(label && { label }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(address !== undefined && { address }),
        ...(category && { category }),
        ...(iconType && { iconType }),
      },
    });

    if (updated) {
      res.json(updated);
      return;
    }
  } catch (err) {
    console.warn(`[PUT /api/places/${id}] Database fallback:`, (err as any)?.message);
  }

  const index = inMemoryPlaces.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Place not found' });
    return;
  }

  inMemoryPlaces[index] = {
    ...inMemoryPlaces[index],
    ...(label && { label }),
    ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
    ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
    ...(address !== undefined && { address }),
    ...(category && { category }),
    ...(iconType && { iconType }),
    updatedAt: new Date().toISOString(),
  };

  res.json(inMemoryPlaces[index]);
});

/**
 * DELETE /api/places/:id
 * Delete a saved place
 */
router.delete('/places/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await (prisma as any).savedPlace?.delete({
      where: { id },
    });
    res.json({ success: true, id });
    return;
  } catch (err) {
    console.warn(`[DELETE /api/places/${id}] Database fallback:`, (err as any)?.message);
  }

  const initialLen = inMemoryPlaces.length;
  inMemoryPlaces = inMemoryPlaces.filter((p) => p.id !== id);

  if (inMemoryPlaces.length === initialLen) {
    res.status(404).json({ error: 'Place not found' });
    return;
  }

  res.json({ success: true, id });
});

/**
 * GET /api/patients/:patientId/location-logs
 * Fetch location snapshot history and derived visits for a specific patient
 */
router.get('/patients/:patientId/location-logs', async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params;
  try {
    const logs = await (prisma as any).locationLog?.findMany({
      where: { patientId },
      include: { savedPlace: true },
      orderBy: { timestamp: 'desc' },
      take: 25,
    });

    if (logs !== undefined && logs !== null) {
      const formatted = logs.map((l: any) => ({
        id: l.id,
        patientId: l.patientId,
        savedPlaceId: l.savedPlaceId,
        latitude: l.latitude,
        longitude: l.longitude,
        timestamp: l.timestamp,
        placeLabel: l.savedPlace?.label || null,
        category: l.savedPlace?.category || null,
      }));
      res.json(formatted);
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${patientId}/location-logs] Database fallback:`, (err as any)?.message);
  }

  // Fallback in-memory logs strictly filtered by patientId
  const filtered = inMemoryLogs.filter((l) => l.patientId === patientId);
  res.json(filtered);
});

/**
 * POST /api/patients/:patientId/location-logs
 * Record an on-demand location snapshot
 */
router.post('/patients/:patientId/location-logs', async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params;
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'Missing latitude or longitude' });
    return;
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Find if within 150m of any saved place
  let nearestPlace: SavedPlaceItem | null = null;
  let minDistance = Infinity;

  const currentPlaces = inMemoryPlaces.filter((p) => p.patientId === patientId || true);
  for (const place of currentPlaces) {
    const dist = calculateDistanceMeters(lat, lng, place.latitude, place.longitude);
    if (dist < 150 && dist < minDistance) {
      minDistance = dist;
      nearestPlace = place;
    }
  }

  try {
    const created = await (prisma as any).locationLog?.create({
      data: {
        patientId,
        latitude: lat,
        longitude: lng,
        savedPlaceId: nearestPlace?.id || null,
      },
      include: {
        savedPlace: true,
      },
    });

    if (created) {
      res.status(201).json({
        id: created.id,
        patientId: created.patientId,
        savedPlaceId: created.savedPlaceId,
        latitude: created.latitude,
        longitude: created.longitude,
        timestamp: created.timestamp,
        placeLabel: created.savedPlace?.label || null,
        category: created.savedPlace?.category || null,
        distanceToPlace: nearestPlace ? Math.round(minDistance) : null,
      });
      return;
    }
  } catch (err) {
    console.warn(`[POST /api/patients/${patientId}/location-logs] Database fallback:`, (err as any)?.message);
  }

  const newLog: LocationLogItem = {
    id: `log_${Date.now()}`,
    patientId,
    savedPlaceId: nearestPlace?.id || null,
    latitude: lat,
    longitude: lng,
    timestamp: new Date().toISOString(),
    placeLabel: nearestPlace?.label || undefined,
    category: nearestPlace?.category || undefined,
  };

  inMemoryLogs.unshift(newLog);
  res.status(201).json({
    ...newLog,
    distanceToPlace: nearestPlace ? Math.round(minDistance) : null,
  });
});

export default router;
