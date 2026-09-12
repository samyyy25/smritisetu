import React, { useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, Calendar, MapPin, Heart, Film, Image as ImageIcon } from 'lucide-react';

export interface MemoryItem {
  id: string;
  photoUrl: string | null;
  videoUrl?: string | null;
  mediaType?: 'photo' | 'video';
  personName: string | null;
  relationship: string | null;
  year: string | null;
  place: string | null;
  description: string | null;
  voiceNoteUrl?: string | null;
  createdAt: string;
}

interface MemoryVideoModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
}

export const MemoryVideoModal: React.FC<MemoryVideoModalProps> = ({ memory, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Auto-play video when modal opens
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('[MemoryVideoModal] Autoplay was prevented:', err);
      });
    }
  }, [memory]);

  if (!memory) return null;

  // Determine if this memory is a video
  const isVideo =
    memory.mediaType === 'video' ||
    Boolean(memory.videoUrl) ||
    Boolean(memory.photoUrl?.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) ||
    Boolean(memory.photoUrl?.startsWith('data:video/'));

  const mediaSource = memory.videoUrl || memory.photoUrl || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-slate-100">
        {/* Top Header */}
        <div className="bg-[#07382E] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-teal-200">
              {isVideo ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">
                {isVideo ? 'Playable Video Memory' : 'Life Photo Memory'}
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {memory.personName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Display Area (Video Player or Image) */}
        <div className="relative bg-black flex items-center justify-center aspect-[16/10] sm:aspect-[16/9] max-h-[460px] overflow-hidden">
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaSource}
              controls
              playsInline
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={mediaSource}
              alt={memory.personName || 'Memory'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800';
              }}
            />
          )}
        </div>

        {/* Narrative & Details Area */}
        <div className="p-5 sm:p-6 bg-white space-y-3 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {memory.personName}
              </h2>
              {memory.relationship && (
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF6F3] text-[#0D5C4D]">
                  {memory.relationship}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              {memory.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">{memory.year}</span>
                </span>
              )}
              {memory.place && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{memory.place}</span>
                </span>
              )}
            </div>
          </div>

          {memory.description && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed font-serif">
              "{memory.description}"
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-600" />
              <span>Preserved Memory Moment</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
