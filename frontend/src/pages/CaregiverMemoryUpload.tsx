import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mic } from 'lucide-react';
import { MediaCaptureUpload, MediaType } from '../components/design-system/MediaCaptureUpload';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';

export const CaregiverMemoryUpload: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
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
    year: '',
    place: '',
    description: '',
    mediaUrl: '',
    mediaType: 'photo',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const isVideo = formData.mediaType === 'video';
      const response = await fetch(`${API_BASE_URL}/api/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: DEMO_PATIENT_ID,
          personName: formData.personName,
          relationship: formData.relationship,
          year: formData.year,
          place: formData.place,
          description: formData.description,
          photoUrl: formData.mediaUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop',
          videoUrl: isVideo ? formData.mediaUrl : null,
          mediaType: formData.mediaType,
          voiceNoteUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save memory');
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#07382E] px-6 py-4 flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-bold tracking-wide">Upload or Record a Memory</h1>
          <div className="w-5" />
        </div>

        <div className="p-6 md:p-8">
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Add a family photo, take a camera snapshot, or record a video message. Media is added to the patient's interactive album and used to personalize memory recall games.
          </p>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-xl font-bold text-slate-800">Memory Preserved!</h2>
              <p className="text-slate-500 mt-2 text-sm">Returning to caregiver dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Media Capture & Upload Suite */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Memory Photo or Video *
                </label>
                <MediaCaptureUpload
                  mediaUrl={formData.mediaUrl}
                  mediaType={formData.mediaType}
                  onChange={({ mediaUrl, mediaType }) => {
                    setFormData((prev) => ({
                      ...prev,
                      mediaUrl,
                      mediaType,
                    }));
                  }}
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Who is in this photo / video? *
                  </label>
                  <input
                    type="text"
                    name="personName"
                    required
                    value={formData.personName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh and Priya (Daughter)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    name="relationship"
                    required
                    value={formData.relationship}
                    onChange={handleChange}
                    placeholder="e.g. Daughter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Year (Approx)
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g. 1995"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Place / Occasion
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    placeholder="e.g. Tezpur Ancestral Courtyard"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Short Story / Context
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the moment or event so the AI companion can reminisce with the patient..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C4D] resize-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !formData.personName}
                className="w-full bg-[#0D5C4D] text-white rounded-xl py-3.5 font-bold shadow-md hover:bg-[#07382E] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? 'Saving Memory...' : 'Save Memory'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
