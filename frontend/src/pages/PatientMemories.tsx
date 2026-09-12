import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  Heart,
  Calendar,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Play,
  Film,
  Sparkles
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { MediaCaptureUpload, MediaType } from '../components/design-system/MediaCaptureUpload';
import { MemoryVideoModal, MemoryItem } from '../components/MemoryVideoModal';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';

const nodeColors = [
  { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-200', line: 'bg-emerald-300' },
  { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-200', line: 'bg-amber-300' },
  { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-200', line: 'bg-rose-300' },
  { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-200', line: 'bg-blue-300' },
  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-200', line: 'bg-purple-300' },
];

const DEFAULT_FALLBACK_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_video_1',
    photoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-40089-large.mp4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-40089-large.mp4',
    mediaType: 'video',
    personName: 'Rongali Bihu Family Gathering & Dance',
    relationship: 'Family',
    year: '2023',
    place: 'Ancestral Courtyard, Tezpur',
    description: 'We gathered together in traditional muga silk attire, singing folk songs and celebrating Bihu joyfully.',
    voiceNoteUrl: null,
    createdAt: new Date('2023-04-14').toISOString(),
  },
  {
    id: 'mem_1',
    photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Priya Sharma (Daughter)',
    relationship: 'Daughter',
    year: '2019',
    place: 'Guwahati, Assam',
    description: 'Priya graduation day at Gauhati University. We had traditional pitha and sweets together.',
    voiceNoteUrl: null,
    createdAt: new Date('2019-06-15').toISOString(),
  },
  {
    id: 'mem_video_2',
    photoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-elderly-woman-sitting-on-a-bench-and-smiling-41712-large.mp4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-elderly-woman-sitting-on-a-bench-and-smiling-41712-large.mp4',
    mediaType: 'video',
    personName: 'Grandmother Sitting in Morning Sun',
    relationship: 'Family',
    year: '2024',
    place: 'Brahmaputra Riverside Walkway',
    description: 'A peaceful winter morning basking in gentle sunshine with fresh Assam tea.',
    voiceNoteUrl: null,
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'mem_2',
    photoUrl: 'https://images.unsplash.com/photo-1506863530036-1ef0d464f158?q=80&w=800&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Rohan Sharma (Grandson)',
    relationship: 'Grandson',
    year: '2022',
    place: 'Kaziranga Park',
    description: 'Rohan saw a one-horned rhino for the first time and held my hand throughout the safari.',
    voiceNoteUrl: null,
    createdAt: new Date('2022-03-20').toISOString(),
  },
  {
    id: 'mem_4',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    mediaType: 'photo',
    personName: 'Dr. Ramesh Sharma (Husband)',
    relationship: 'Husband',
    year: '1978',
    place: 'Shillong, Meghalaya',
    description: 'Our honeymoon trip to Ward Lake and elephant falls in beautiful spring blossom.',
    voiceNoteUrl: null,
    createdAt: new Date('1978-10-10').toISOString(),
  },
];

export const PatientMemories: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video / Photo Playback Modal State
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Add Memory Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [newMemory, setNewMemory] = useState<{
    personName: string;
    relationship: string;
    year: string;
    place: string;
    description: string;
    mediaUrl: string;
    mediaType: MediaType;
  }>({
    personName: '',
    relationship: '',
    year: new Date().getFullYear().toString(),
    place: '',
    description: '',
    mediaUrl: '',
    mediaType: 'photo',
  });

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const yA = parseInt(a.year || '0', 10);
            const yB = parseInt(b.year || '0', 10);
            if (yA && yB) return yA - yB;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
          setMemories(sorted);
        }
      }
    } catch (err: any) {
      console.warn('[PatientMemories] Failed to fetch memories from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.personName.trim()) return;

    setIsSubmitting(true);
    try {
      const isVideo = newMemory.mediaType === 'video';
      const res = await fetch(`${API_BASE_URL}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: DEMO_PATIENT_ID,
          personName: newMemory.personName,
          relationship: newMemory.relationship,
          year: newMemory.year,
          place: newMemory.place,
          description: newMemory.description,
          photoUrl: newMemory.mediaUrl || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800',
          videoUrl: isVideo ? newMemory.mediaUrl : null,
          mediaType: newMemory.mediaType,
        }),
      });

      if (!res.ok) throw new Error('Failed to save memory');
      const created = await res.json();

      setMemories((prev) => [...prev, created]);
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setIsAddModalOpen(false);
        setNewMemory({
          personName: '',
          relationship: '',
          year: new Date().getFullYear().toString(),
          place: '',
          description: '',
          mediaUrl: '',
          mediaType: 'photo',
        });
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to save memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // Localized memory helper
  const getLocalizedMemory = (mem: MemoryItem) => {
    if (mem.id === 'mem_video_1' || mem.personName?.toLowerCase().includes('bihu')) {
      return {
        ...mem,
        personName: t('mem_bihu_title', mem.personName || ''),
        relationship: t('rel_family', mem.relationship || ''),
        place: t('loc_tezpur', mem.place || ''),
        description: t('mem_bihu_desc', mem.description || ''),
      };
    }
    if (mem.id === 'mem_1' || mem.personName?.toLowerCase().includes('priya')) {
      return {
        ...mem,
        personName: t('mem_priya_title', mem.personName || ''),
        relationship: t('rel_daughter', mem.relationship || ''),
        place: t('loc_guwahati', mem.place || ''),
        description: t('mem_priya_desc', mem.description || ''),
      };
    }
    if (mem.id === 'mem_video_2' || mem.personName?.toLowerCase().includes('grandmother')) {
      return {
        ...mem,
        personName: t('mem_grandmother_title', mem.personName || ''),
        relationship: t('rel_family', mem.relationship || ''),
        place: t('loc_brahmaputra', mem.place || ''),
        description: t('mem_grandmother_desc', mem.description || ''),
      };
    }
    if (mem.id === 'mem_2' || mem.personName?.toLowerCase().includes('rohan')) {
      return {
        ...mem,
        personName: t('mem_rohan_title', mem.personName || ''),
        relationship: t('rel_grandson', mem.relationship || ''),
        place: t('loc_kaziranga', mem.place || ''),
        description: t('mem_rohan_desc', mem.description || ''),
      };
    }
    if (mem.id === 'mem_4' || mem.personName?.toLowerCase().includes('ramesh')) {
      return {
        ...mem,
        personName: t('mem_ramesh_title', mem.personName || ''),
        relationship: t('rel_husband', mem.relationship || ''),
        place: t('loc_shillong', mem.place || ''),
        description: t('mem_ramesh_desc', mem.description || ''),
      };
    }
    return {
      ...mem,
      relationship: mem.relationship ? t(`rel_${mem.relationship.toLowerCase()}`, mem.relationship) : '',
    };
  };

  return (
    <MobileContainer showTopBar={false}>
      {/* Video / Photo Full View & Playback Modal */}
      <MemoryVideoModal
        memory={selectedMemory ? getLocalizedMemory(selectedMemory) : null}
        onClose={() => setSelectedMemory(null)}
      />

      {/* Add Memory Modal with Device Upload, Photo, and Video capture */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D5C4D] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('modal_add_memory_title', 'Add New Memory')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800">{t('memory_saved', 'Memory Saved!')}</h4>
                <p className="text-xs text-slate-500">{t('memory_saved_desc', 'Added to your life journey timeline with playable media.')}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateMemory} className="space-y-3.5 pt-3">
                {/* 1. Device Media Upload Suite (Take Photo, Record Video, Device Files) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {t('field_photo_or_video', 'Memory Photo or Video *')}
                  </label>
                  <MediaCaptureUpload
                    mediaUrl={newMemory.mediaUrl}
                    mediaType={newMemory.mediaType}
                    onChange={({ mediaUrl, mediaType }) => {
                      setNewMemory((prev) => ({
                        ...prev,
                        mediaUrl,
                        mediaType,
                      }));
                    }}
                  />
                </div>

                {/* 2. Person Name / Memory Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('field_title', 'Person / Memory Title')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Day / Granddaughter Riya"
                    value={newMemory.personName}
                    onChange={(e) => setNewMemory({ ...newMemory, personName: e.target.value })}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* 3. Year & Relationship Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('field_year', 'Year')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1985"
                      value={newMemory.year}
                      onChange={(e) => setNewMemory({ ...newMemory, year: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('field_relationship', 'Relationship')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Daughter / Family"
                      value={newMemory.relationship}
                      onChange={(e) => setNewMemory({ ...newMemory, relationship: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* 4. Place / Location */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('field_location', 'Place / Location')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guwahati, Assam"
                    value={newMemory.place}
                    onChange={(e) => setNewMemory({ ...newMemory, place: e.target.value })}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* 5. Description / Memory Story */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('field_description', 'Story / Description')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What made this moment special..."
                    value={newMemory.description}
                    onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newMemory.personName}
                    className="flex-1 py-3 rounded-xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? t('saving', 'Saving...') : t('save_memory', 'Save Memory')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-200"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Custom Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/patient/home')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Go to Home"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            {t('memories_title', 'My Memories')}
          </span>

          {/* "+ Add Memory" Button - only visible when modal is closed */}
          {!isAddModalOpen ? (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#0D5C4D] hover:bg-[#07382E] text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('add_memory', 'Add Memory')}</span>
            </button>
          ) : (
            <div className="w-24" />
          )}
        </div>

        {/* Timeline Content Area */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-9 h-9 rounded-full border-4 border-teal-200 border-t-[#0D5C4D] animate-spin" />
              <p className="text-sm text-slate-500 font-semibold">{t('opening_album', 'Opening your life album...')}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-5 rounded-3xl text-sm border border-red-200 text-center space-y-3 my-auto">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchMemories}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                {t('retry_loading', 'Retry Loading')}
              </button>
            </div>
          ) : memories.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm my-auto">
              <div className="w-16 h-16 bg-[#FDEEF1] text-[#E11D48] rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">
                {t('no_memories_yet', 'No memories added yet.')}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {t('add_first_memory', 'Add your first family photo or video milestone.')}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#0D5C4D] text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('add_memory', 'Add Memory')}</span>
              </button>
            </div>
          ) : (
            /* Vertical Colored-Dot Timeline with interactive photo/video cards */
            <div className="relative pl-6 sm:pl-8 space-y-6 pb-6">
              {/* Left Continuous Connecting Line */}
              <div className="absolute left-[35px] sm:left-[39px] top-6 bottom-8 w-1 bg-gradient-to-b from-emerald-400 via-amber-400 via-rose-400 to-purple-500 rounded-full" />

              {memories.map((rawMemory, index) => {
                const memory = getLocalizedMemory(rawMemory);
                const colorConfig = nodeColors[index % nodeColors.length];
                const isVideo =
                  memory.mediaType === 'video' ||
                  Boolean(memory.videoUrl) ||
                  Boolean(memory.photoUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ||
                  Boolean(memory.photoUrl?.startsWith('data:video/'));

                const mediaPreview = memory.photoUrl || memory.videoUrl || '';

                return (
                  <div key={memory.id} className="relative flex items-start space-x-4 group">
                    {/* Colored Circular Year/Sequence Node */}
                    <div
                      className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${colorConfig.bg} text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}
                    >
                      <span>{memory.year ? memory.year : `${index + 1}`}</span>
                    </div>

                    {/* Memory Content Card (Click to open full player/viewer) */}
                    <div
                      onClick={() => setSelectedMemory(memory)}
                      className="flex-1 bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-soft-card flex items-center justify-between gap-3 hover:shadow-md hover:border-[#0D5C4D]/30 transition overflow-hidden cursor-pointer select-none"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            {memory.year || 'Archive'}
                          </span>
                          {isVideo && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                              <Film className="w-3 h-3" />
                              <span>{t('video_memory_badge', 'Video Memory')}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate group-hover:text-[#0D5C4D] transition-colors">
                          {memory.personName}
                        </h3>
                        {memory.relationship && (
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#0D5C4D] block truncate">
                            {memory.relationship} {memory.place && `• ${memory.place}`}
                          </span>
                        )}
                        {memory.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {memory.description}
                          </p>
                        )}
                      </div>

                      {/* Photo / Video Thumbnail on Right */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 min-w-[5rem] min-h-[5rem] sm:min-w-[6rem] sm:min-h-[6rem] max-w-[6rem] max-h-[6rem] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 flex-shrink-0 shadow-2xs group-hover:ring-2 ring-[#0D5C4D]/30 transition-all">
                        {mediaPreview ? (
                          <>
                            {isVideo ? (
                              <div className="w-full h-full relative bg-slate-950 flex items-center justify-center">
                                <video
                                  src={mediaPreview}
                                  className="w-full h-full object-cover opacity-80"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={mediaPreview}
                                alt={`Photo of ${memory.personName}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 block"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=300';
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Terminal "Today / My memories" Node */}
              <div className="relative flex items-center space-x-4 pt-2">
                <div className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex-1">
                  <span className="text-xs font-bold text-purple-900 block">{t('today', 'Today')}</span>
                  <span className="text-[11px] text-purple-700">{t('memories_journey_subtitle', 'My continuing memories journey')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavBar activeTab="memories" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default PatientMemories;
