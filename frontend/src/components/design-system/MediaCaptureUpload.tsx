import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  Upload,
  RefreshCw,
  X,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Film,
  Image as ImageIcon,
  Square,
  Sparkles
} from 'lucide-react';

export type MediaType = 'photo' | 'video';

export interface MediaCaptureUploadProps {
  mediaUrl?: string;
  mediaType?: MediaType;
  onChange: (result: { mediaUrl: string; mediaType: MediaType; fileName?: string }) => void;
  className?: string;
}

const SAMPLE_PRESETS: { label: string; type: MediaType; url: string; preview: string }[] = [
  {
    label: 'Family Bihu Dance Video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-family-walking-together-in-nature-40089-large.mp4',
    preview: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Grandmother Smiling Video',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-elderly-woman-sitting-on-a-bench-and-smiling-41712-large.mp4',
    preview: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
  },
  {
    label: 'Traditional Tea Garden Photo',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    preview: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Family Portrait Photo',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop',
    preview: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
  },
];

export const MediaCaptureUpload: React.FC<MediaCaptureUploadProps> = ({
  mediaUrl,
  mediaType = 'photo',
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'take_photo' | 'record_video' | 'presets'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Stream & Recorder references
  const videoStreamRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream cleanly
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  // Clean up on unmount or tab change
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Start Camera Stream
  const startCamera = async (forVideoRecording: boolean) => {
    stopCameraStream();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: forVideoRecording,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        await videoStreamRef.current.play();
      }
    } catch (err: any) {
      console.warn('[MediaCaptureUpload] Camera access issue:', err);
      setCameraError(
        'Camera or microphone access was blocked or unavailable on this device. You can still use the "Upload from Device" option.'
      );
      setIsCameraActive(false);
    }
  };

  // Switch tabs & start camera if needed
  const handleTabSelect = (tab: 'upload' | 'take_photo' | 'record_video' | 'presets') => {
    setActiveTab(tab);
    setCameraError(null);

    if (tab === 'take_photo') {
      startCamera(false);
    } else if (tab === 'record_video') {
      startCamera(true);
    } else {
      stopCameraStream();
    }
  };

  // Capture Snapshot from Camera Stream
  const handleCapturePhoto = () => {
    if (!videoStreamRef.current) return;
    const video = videoStreamRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      stopCameraStream();
      onChange({
        mediaUrl: dataUrl,
        mediaType: 'photo',
        fileName: `snapshot_${Date.now()}.jpg`,
      });
      setActiveTab('upload');
    }
  };

  // Start Recording Video
  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];

    try {
      let options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: '' };
        }
      }

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/mp4';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);

        stopCameraStream();
        onChange({
          mediaUrl: videoUrl,
          mediaType: 'video',
          fileName: `recorded_memory_${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`,
        });
        setActiveTab('upload');
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('[MediaCaptureUpload] Video recording error:', err);
      setCameraError('Video recording is not supported in this browser format.');
    }
  };

  // Stop Recording Video
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // Handle Device File Upload
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i);
    const determinedType: MediaType = isVideo ? 'video' : 'photo';

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultUrl = event.target?.result as string;
      onChange({
        mediaUrl: resultUrl,
        mediaType: determinedType,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  // Clear current selected media
  const handleClearMedia = () => {
    onChange({
      mediaUrl: '',
      mediaType: 'photo',
    });
  };

  const hasSelectedMedia = Boolean(mediaUrl && mediaUrl.trim().length > 0);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 4 Action Mode Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl select-none">
        <button
          type="button"
          onClick={() => handleTabSelect('upload')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upload'
              ? 'bg-white text-[#0D5C4D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('take_photo')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'take_photo'
              ? 'bg-white text-[#0D5C4D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Take Photo</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('record_video')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'record_video'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Record Video</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('presets')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'presets'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sample Album</span>
        </button>
      </div>

      {/* Mode 1: Upload from Device */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          {hasSelectedMedia ? (
            /* Selected Media Preview Card */
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#0D5C4D]/30 bg-slate-900 shadow-md group">
              {mediaType === 'video' ? (
                <div className="relative aspect-[16/9] max-h-56 bg-black flex items-center justify-center">
                  <video
                    ref={previewVideoRef}
                    src={mediaUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 z-10 px-2.5 py-1 bg-rose-600/90 text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Film className="w-3 h-3" />
                    <span>Playable Video Memory</span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/10] max-h-56 bg-slate-100 flex items-center justify-center">
                  <img
                    src={mediaUrl}
                    alt="Memory Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=600';
                    }}
                  />
                  <div className="absolute top-2 left-2 z-10 px-2.5 py-1 bg-[#0D5C4D]/90 text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <ImageIcon className="w-3 h-3" />
                    <span>Photo Memory</span>
                  </div>
                </div>
              )}

              {/* Action Buttons to Replace or Remove */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Media Attached & Ready</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Remove media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag and Drop / Browse Trigger */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#0D5C4D] rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50/80 hover:bg-[#EAF6F3]/40 transition-all cursor-pointer group select-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 group-hover:border-[#0D5C4D]/30 flex items-center justify-center text-[#0D5C4D] mb-3 group-hover:scale-105 transition-all">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Choose Photo or Video from your Device
              </span>
              <span className="text-xs text-slate-400 mt-1 text-center">
                Supports JPG, PNG, WEBP, MP4, WEBM, MOV (Up to 50MB)
              </span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Mode 2: Take Live Photo */}
      {activeTab === 'take_photo' && (
        <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-black space-y-0 text-white relative shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 bg-slate-50 text-slate-700">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#0D5C4D] text-white rounded-xl text-xs font-bold"
              >
                Choose from files instead
              </button>
            </div>
          ) : (
            <div className="relative w-full h-64 sm:h-72 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 z-20">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4 text-[#0D5C4D]" />
                  <span>Capture Snapshot</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Record Live Video */}
      {activeTab === 'record_video' && (
        <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-black space-y-0 text-white relative shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 bg-slate-50 text-slate-700">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#0D5C4D] text-white rounded-xl text-xs font-bold"
              >
                Upload video from device instead
              </button>
            </div>
          ) : (
            <div className="relative w-full h-64 sm:h-72 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoStreamRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Recording Indicator & Timer */}
              {isRecording && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>
                    REC {Math.floor(recordingSeconds / 60)}:
                    {(recordingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 z-20">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <span className="w-3 h-3 rounded-full bg-white" />
                    <span>Start Video Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                    <span>Finish & Save Video</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 4: Pre-packaged Sample Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 font-medium px-1">
            Pick a pre-loaded sample photo or video memory for quick testing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange({
                    mediaUrl: preset.url,
                    mediaType: preset.type,
                    fileName: preset.label,
                  });
                  setActiveTab('upload');
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0D5C4D] bg-white hover:bg-slate-50 flex items-center gap-3 text-left transition-all group"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={preset.preview}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                  />
                  {preset.type === 'video' && (
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Play className="w-4 h-4 fill-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-[#0D5C4D]">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {preset.type === 'video' ? '🎬 Playable Video' : '📷 Photo'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
