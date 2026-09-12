import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

const DEFAULT_MEMORIES = [
  // Anita Devi memories (DEMO_PATIENT_ID)
  {
    id: 'mem_anita_1',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Priya Sharma (Daughter)',
    relationship: 'Daughter',
    year: '2019',
    place: 'Guwahati, Assam',
    description: "Priya's convocation ceremony at Gauhati University. We wore traditional muga silk and celebrated with homemade pitha.",
    voiceNoteUrl: null,
    createdAt: new Date('2019-06-15').toISOString(),
  },
  {
    id: 'mem_anita_2',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    photoUrl: 'https://images.unsplash.com/photo-1506863530036-1ef0d464f158?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Rohan Sharma (Grandson)',
    relationship: 'Grandson',
    year: '2022',
    place: 'Kaziranga National Park',
    description: 'Rohan holding my hand when we saw the one-horned rhino for the first time during our sunrise morning safari.',
    voiceNoteUrl: null,
    createdAt: new Date('2022-03-20').toISOString(),
  },
  {
    id: 'mem_anita_3',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-40089-large.mp4',
    mediaType: 'video',
    personName: 'Family Bihu Nature Walk',
    relationship: 'Family',
    year: '2023',
    place: 'Ancestral Courtyard, Tezpur',
    description: 'Family springtime walk together playing the dhol and enjoying the fresh green tea garden breeze.',
    voiceNoteUrl: null,
    createdAt: new Date('2023-04-14').toISOString(),
  },
  {
    id: 'mem_anita_4',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Late Dhiren Sharma (Husband)',
    relationship: 'Husband',
    year: '1976',
    place: 'Shillong, Meghalaya',
    description: 'Our honeymoon visit to Ward Lake and Elephant Falls during the spring cherry blossom season.',
    voiceNoteUrl: null,
    createdAt: new Date('1976-10-10').toISOString(),
  },
  {
    id: 'mem_anita_5',
    patientId: '23f55848-e317-4a06-ae05-3aa42d94cd10',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-elderly-woman-sitting-on-a-bench-and-smiling-41712-large.mp4',
    mediaType: 'video',
    personName: 'Garden Morning Sunshine Moments',
    relationship: 'Memories',
    year: '2024',
    place: 'Panbazar Garden, Guwahati',
    description: 'Sitting peacefully in the morning sun with sweet Assam chai watching the songbirds.',
    voiceNoteUrl: null,
    createdAt: new Date('2024-02-18').toISOString(),
  },
  // Ramesh Das memories
  {
    id: 'mem_ramesh_1',
    patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Utpal Das (Son)',
    relationship: 'Son',
    year: '2018',
    place: 'Jorhat, Assam',
    description: 'Utpal receiving his mechanical engineering degree with honors from Jorhat Engineering College.',
    voiceNoteUrl: null,
    createdAt: new Date('2018-07-22').toISOString(),
  },
  {
    id: 'mem_ramesh_2',
    patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Ananya Das (Daughter-in-law)',
    relationship: 'Daughter-in-law',
    year: '2020',
    place: 'Guwahati, Assam',
    description: 'Welcoming Ananya into our home during the family reception ceremony.',
    voiceNoteUrl: null,
    createdAt: new Date('2020-11-12').toISOString(),
  },
  {
    id: 'mem_ramesh_3',
    patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Tea Estate Retirement Farewell',
    relationship: 'Colleagues & Friends',
    year: '2021',
    place: 'Dibrugarh, Assam',
    description: 'Colleagues honoring 35 years of tea garden management with traditional Assamese gamusa and brass xorai.',
    voiceNoteUrl: null,
    createdAt: new Date('2021-03-31').toISOString(),
  },
  {
    id: 'mem_ramesh_4',
    patientId: 'a1b2c3d4-e5f6-4a01-9b01-111111111111',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Aarav Das (Grandson)',
    relationship: 'Grandson',
    year: '2023',
    place: 'Silpukhuri, Guwahati',
    description: 'Aarav playing in the living room with his wooden train set.',
    voiceNoteUrl: null,
    createdAt: new Date('2023-08-10').toISOString(),
  },
  // Maya Devi memories
  {
    id: 'mem_maya_1',
    patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Sunil Thapa (Son)',
    relationship: 'Son',
    year: '2020',
    place: 'Guwahati, Assam',
    description: 'Sunil opening his first bakery and tea boutique in Ganeshguri.',
    voiceNoteUrl: null,
    createdAt: new Date('2020-02-14').toISOString(),
  },
  {
    id: 'mem_maya_2',
    patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Pooja Thapa (Daughter)',
    relationship: 'Daughter',
    year: '2021',
    place: 'Shillong, Meghalaya',
    description: 'Pooja returning home for Dashain festival holidays.',
    voiceNoteUrl: null,
    createdAt: new Date('2021-10-15').toISOString(),
  },
  {
    id: 'mem_maya_3',
    patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Dashain Festival Family Blessing',
    relationship: 'Family & Grandchildren',
    year: '2022',
    place: 'Shillong, Meghalaya',
    description: 'Putting red Tika and golden Jamara on grandchildren and blessing the whole family.',
    voiceNoteUrl: null,
    createdAt: new Date('2022-10-05').toISOString(),
  },
  {
    id: 'mem_maya_4',
    patientId: 'a1b2c3d4-e5f6-4a02-9b02-222222222222',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Late Manbahadur Thapa (Husband)',
    relationship: 'Husband',
    year: '1980',
    place: 'Darjeeling',
    description: 'A quiet evening walking along Chowrasta overlooking the Kanchenjunga peaks.',
    voiceNoteUrl: null,
    createdAt: new Date('1980-05-12').toISOString(),
  },
  // Bikash Saikia memories
  {
    id: 'mem_bikash_1',
    patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Mainao Saikia (Daughter)',
    relationship: 'Daughter',
    year: '2019',
    place: 'Kokrajhar, Assam',
    description: 'Mainao dressed in traditional Dokhona during college annual day.',
    voiceNoteUrl: null,
    createdAt: new Date('2019-03-10').toISOString(),
  },
  {
    id: 'mem_bikash_2',
    patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Bwisagu Spring Festival',
    relationship: 'Community Elders',
    year: '2021',
    place: 'Kokrajhar, Assam',
    description: 'Playing traditional kham and sifung flute with village elders to welcome the new year.',
    voiceNoteUrl: null,
    createdAt: new Date('2021-04-15').toISOString(),
  },
  {
    id: 'mem_bikash_3',
    patientId: 'a1b2c3d4-e5f6-4a03-9b03-333333333333',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    videoUrl: null,
    mediaType: 'photo',
    personName: 'Sanjoy Saikia (Son)',
    relationship: 'Son',
    year: '2022',
    place: 'Bongaigaon, Assam',
    description: 'Sanjoy visiting home with his new motorcycle.',
    voiceNoteUrl: null,
    createdAt: new Date('2022-09-18').toISOString(),
  },
];

let inMemoryMemories = [...DEFAULT_MEMORIES];

/**
 * GET /api/patients/:id/memories
 * Fetch all memories for a specific patient, ordered by newest first.
 */
router.get('/patients/:id/memories', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const memories = await (prisma as any).memory.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
    });
    if (memories && memories.length > 0) {
      // Map mediaType and videoUrl if present or infer from photoUrl
      const formatted = memories.map((m: any) => {
        const isVid =
          m.mediaType === 'video' ||
          Boolean(m.videoUrl) ||
          Boolean(m.photoUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ||
          Boolean(m.photoUrl?.startsWith('data:video/'));
        return {
          ...m,
          mediaType: isVid ? 'video' : 'photo',
          videoUrl: m.videoUrl || (isVid ? m.photoUrl : null),
        };
      });
      res.json(formatted);
      return;
    }
  } catch (err) {
    console.warn(`[GET /api/patients/${id}/memories] Database unreachable, serving fallback memories:`, (err as any)?.message);
  }

  const filtered = inMemoryMemories.filter((m) => m.patientId === id);
  res.json(filtered.length > 0 ? filtered : inMemoryMemories.filter((m) => m.patientId === '23f55848-e317-4a06-ae05-3aa42d94cd10'));
});

/**
 * POST /api/memories
 * Create a new memory record uploaded by a caregiver.
 */
router.post('/memories', async (req: Request, res: Response): Promise<void> => {
  const {
    patientId,
    photoUrl,
    videoUrl,
    mediaType,
    personName,
    relationship,
    year,
    place,
    description,
    voiceNoteUrl,
  } = req.body;

  if (!patientId || !personName || !relationship) {
    res.status(400).json({ error: 'Missing required fields: patientId, personName, relationship' });
    return;
  }

  const effectiveMediaUrl = videoUrl || photoUrl;
  const isVideo = mediaType === 'video' || Boolean(videoUrl) || (photoUrl && photoUrl.includes('.mp4'));

  const memoryRecord = {
    id: `mem_${Date.now()}`,
    patientId,
    photoUrl: effectiveMediaUrl ?? null,
    videoUrl: isVideo ? effectiveMediaUrl : null,
    mediaType: isVideo ? ('video' as const) : ('photo' as const),
    personName,
    relationship,
    year: year ?? null,
    place: place ?? null,
    description: description ?? null,
    voiceNoteUrl: voiceNoteUrl ?? null,
    createdAt: new Date().toISOString(),
  };

  try {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (patient) {
      const created = await (prisma as any).memory.create({
        data: {
          patientId,
          photoUrl: effectiveMediaUrl ?? null,
          videoUrl: isVideo ? effectiveMediaUrl : null,
          mediaType: isVideo ? 'video' : 'photo',
          personName,
          relationship,
          year: year ?? null,
          place: place ?? null,
          description: description ?? null,
          voiceNoteUrl: voiceNoteUrl ?? null,
        },
      });
      res.status(201).json(created);
      return;
    }
    // If patient not in DB, save to in-memory fallback
    inMemoryMemories.unshift(memoryRecord);
    res.status(201).json(memoryRecord);
  } catch (err) {
    console.warn('[POST /api/memories] DB issue, persisting in-memory fallback:', (err as any)?.message);
    inMemoryMemories.unshift(memoryRecord);
    res.status(201).json(memoryRecord);
  }
});

export default router;
