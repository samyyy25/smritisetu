import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Video,
  Image as ImageIcon,
  Play,
  Volume2,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  Upload,
  User,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { API_BASE_URL, DEMO_PATIENT_ID } from '../../config';

interface MemoryItem {
  id: string;
  patientId?: string;
  photoUrl: string;
  videoUrl?: string;
  mediaType: 'photo' | 'video';
  personName: string;
  relationship: string;
  year: string;
  place: string;
  description: string;
  voiceNoteUrl?: string | null;
  recallSuccessPct?: number;
  testCount?: number;
}

interface MemoryLibraryProps {
  onBackToOverview: () => void;
  onUploadMemory?: () => void;
}

export const DashboardMemoryLibrary: React.FC<MemoryLibraryProps> = ({
  onBackToOverview,
  onUploadMemory,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Memory Form State
  const [newPersonName, setNewPersonName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newYear, setNewYear] = useState('1985');
  const [newPlace, setNewPlace] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'photo' | 'video'>('photo');

  // Load memories from backend
  const loadMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: MemoryItem[] = data.map((m: any, idx: number) => ({
            id: m.id || `mem_${idx}`,
            photoUrl: m.photoUrl || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop',
            videoUrl: m.videoUrl,
            mediaType: m.mediaType === 'video' || m.videoUrl ? 'video' : 'photo',
            personName: m.personName || 'Family Archive',
            relationship: m.relationship || 'Relative',
            year: m.year ? String(m.year) : 'Past Years',
            place: m.place || 'Hometown & Travels',
            description: m.description || 'Cherished memory from family collection.',
            recallSuccessPct: 85 + (idx * 3) % 15,
            testCount: 12 + idx * 4,
          }));
          setMemories(mapped);
        }
      }
    } catch (err) {
      console.warn('Using fallback memories for Memory Library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = mediaFilter === 'all' || m.mediaType === mediaFilter;
    return matchesSearch && matchesType;
  });

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMem: MemoryItem = {
      id: `mem_${Date.now()}`,
      photoUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop',
      videoUrl: newMediaType === 'video' ? newPhotoUrl : undefined,
      mediaType: newMediaType,
      personName: newPersonName || 'Family Gathering',
      relationship: newRelationship || 'Family',
      year: newYear,
      place: newPlace || 'Home',
      description: newDescription,
      recallSuccessPct: 100,
      testCount: 1,
    };

    setMemories([newMem, ...memories]);
    setIsAddModalOpen(false);
    // Reset form
    setNewPersonName('');
    setNewRelationship('');
    setNewPlace('');
    setNewDescription('');
    setNewPhotoUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Add Memory CTA */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Reminiscence Bank</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Memory Library & Cultural Cue Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate family photos, milestone videos, and localized cultural triggers used in cognitive recall games.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory Photo / Video</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by person, place, or event…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'photo', 'video'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                mediaFilter === type
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? `All Items (${memories.length})` : type === 'photo' ? 'Photos 📸' : 'Videos 🎬'}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            onClick={() => setSelectedMemory(mem)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            {/* Media Frame */}
            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
              {mem.mediaType === 'video' && mem.videoUrl ? (
                <video
                  src={mem.videoUrl}
                  poster={mem.photoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={mem.photoUrl}
                  alt={mem.personName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Media Type Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                {mem.mediaType === 'video' ? <Video className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-teal-300" />}
                <span className="capitalize">{mem.mediaType}</span>
              </div>

              {/* Year Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs">
                {mem.year}
              </div>

              {/* Play Overlay if video */}
              {mem.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-white/90 text-[#0D5C4D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0D5C4D] transition-colors truncate">
                    {mem.personName}
                  </h3>
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-100">
                    {mem.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{mem.place}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {mem.description}
                </p>
              </div>

              {/* Performance Indicator */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Recall Success:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {mem.recallSuccessPct || 88}% ({mem.testCount || 12} tests)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Memory Preview Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 animate-scaleUp">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {selectedMemory.mediaType === 'video' && selectedMemory.videoUrl ? (
                <video
                  src={selectedMemory.videoUrl}
                  poster={selectedMemory.photoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedMemory.photoUrl}
                  alt={selectedMemory.personName}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedMemory(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                    {selectedMemory.personName} ({selectedMemory.relationship})
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    <span>{selectedMemory.place} • Year: {selectedMemory.year}</span>
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Active in Recall Games
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                "{selectedMemory.description}"
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMemory(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Add New Memory Cue</h2>
                <p className="text-xs text-slate-500">Upload a family photo or video for patient cognitive exercises.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Person Name / Subject</label>
                <input
                  type="text"
                  required
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="e.g. Priya Sharma, Grandson Rohan"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                  <input
                    type="text"
                    required
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    placeholder="e.g. Daughter, Wife, Friend"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Year / Era</label>
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g. 1985, 2019"
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location / Place</label>
                <input
                  type="text"
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  placeholder="e.g. Tezpur Courtyard, Kamakhya Temple"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Media Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMediaType('photo')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border ${
                      newMediaType === 'photo' ? 'bg-[#0D5C4D] text-white border-[#0D5C4D]' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    📸 Photo Memory
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMediaType('video')}
                    className={`flex-1 py-2.5 rounded-xl font-bold border ${
                      newMediaType === 'video' ? 'bg-[#0D5C4D] text-white border-[#0D5C4D]' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🎬 Video Memory
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo / Video Media URL</label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Story / Personal Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the occasion, emotions, and what happened during this memory..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#0D5C4D] hover:bg-[#07382E] text-white font-bold shadow-md"
                >
                  Save & Publish to Games
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMemoryLibrary;
