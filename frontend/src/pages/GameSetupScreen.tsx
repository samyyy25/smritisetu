import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Settings,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  RotateCcw,
  Palette,
  Users,
  Calendar,
  Clock,
  Layers,
  Heart
} from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { BottomNavBar, NavTabId } from '../components/design-system/BottomNavBar';
import { DEMO_PATIENT_ID, API_BASE_URL } from '../config';

interface MemoryItem {
  id: string;
  photoUrl: string | null;
  personName: string | null;
  relationship: string | null;
  year?: string | null;
  place?: string | null;
}

export const GameSetupScreen: React.FC = () => {
  const { gameKey } = useParams<{ gameKey: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State for Who Is This (Memory face management)
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [isAddingFace, setIsAddingFace] = useState(false);
  const [newFace, setNewFace] = useState({
    personName: '',
    relationship: '',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    year: '1995',
    place: 'Guwahati, Assam',
    description: 'Family member face for recognition training.'
  });

  // State for Festival Memories (Cultural pack selection)
  const [activeFestivalPack, setActiveFestivalPack] = useState<'bihu' | 'hornbill' | 'chapchar' | 'wangala'>(() => {
    return (localStorage.getItem('smritisetu_festival_pack') as any) || 'bihu';
  });

  // State for Memory Match
  const [matchTheme, setMatchTheme] = useState<'family' | 'cultural' | 'objects'>(() => {
    return (localStorage.getItem('smritisetu_match_theme') as any) || 'family';
  });
  const [matchGridSize, setMatchGridSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('smritisetu_match_grid_size') || '6', 10);
  });

  // State for Daily Life Challenge
  const [routineSlot, setRoutineSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Success message toast
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Fetch real memories for face management
  useEffect(() => {
    if (gameKey === 'who-is-this') {
      const load = async () => {
        setIsLoadingMemories(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/patients/${DEMO_PATIENT_ID}/memories`);
          if (res.ok) {
            const data = await res.json();
            setMemories(data);
          }
        } catch (e) {
          console.warn('Could not load memories for setup:', e);
        } finally {
          setIsLoadingMemories(false);
        }
      };
      load();
    }
  }, [gameKey]);

  // Add face memory handler
  const handleAddFace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFace.personName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFace,
          patientId: DEMO_PATIENT_ID,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setMemories((prev) => [created, ...prev]);
        setIsAddingFace(false);
        setNewFace({
          personName: '',
          relationship: '',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
          year: '1995',
          place: 'Guwahati, Assam',
          description: 'Family member face for recognition training.'
        });
        showToast('✓ New face added to game content pool!');
      }
    } catch (err) {
      alert('Failed to add memory face');
    }
  };

  // Save Festival Pack handler
  const handleSaveFestivalPack = (packKey: 'bihu' | 'hornbill' | 'chapchar' | 'wangala') => {
    setActiveFestivalPack(packKey);
    localStorage.setItem('smritisetu_festival_pack', packKey);
    showToast(`✓ Active cultural pack set to ${packKey.toUpperCase()}!`);
  };

  // Save Memory Match settings handler
  const handleSaveMatchSettings = (theme: 'family' | 'cultural' | 'objects', size: number) => {
    setMatchTheme(theme);
    setMatchGridSize(size);
    localStorage.setItem('smritisetu_match_theme', theme);
    localStorage.setItem('smritisetu_match_grid_size', size.toString());
    showToast('✓ Memory Match configuration saved!');
  };

  const handleTabChange = (tab: NavTabId) => {
    if (tab === 'home') navigate('/patient/home');
    else if (tab === 'games') navigate('/games');
    else navigate(`/${tab}`);
  };

  // Game Meta mapping
  const getGameMeta = () => {
    switch (gameKey) {
      case 'who-is-this':
        return {
          title: 'Who Is This? Setup',
          subtitle: 'Manage face photos & family relationships used in this game',
          playableRoute: '/games/who-is-this',
          themeColor: 'text-[#E05345]',
          badgeBg: 'bg-[#FDEEE9]',
        };
      case 'festival-memories':
        return {
          title: 'Festival Memories Setup',
          subtitle: 'Select active cultural pack and regional festival timelines',
          playableRoute: '/games/festival-memories',
          themeColor: 'text-[#D97706]',
          badgeBg: 'bg-[#FEF5E7]',
        };
      case 'memory-match':
        return {
          title: 'Memory Match Setup',
          subtitle: 'Configure card pair themes and grid dimensions',
          playableRoute: '/games/memory-match',
          themeColor: 'text-[#0D5C4D]',
          badgeBg: 'bg-[#EAF6F4]',
        };
      case 'remember-speak':
        return {
          title: 'Remember & Speak Setup',
          subtitle: 'Select prompt photograph and spoken recall focus',
          playableRoute: '/games/remember-speak',
          themeColor: 'text-[#7C3AED]',
          badgeBg: 'bg-[#F3EEF9]',
        };
      case 'daily-life':
        return {
          title: 'Daily Life Challenge Setup',
          subtitle: 'Configure daily routine target answers and times of day',
          playableRoute: '/games/daily-life',
          themeColor: 'text-[#2563EB]',
          badgeBg: 'bg-[#EDF5FE]',
        };
      case 'life-story':
        return {
          title: 'My Life Story Setup',
          subtitle: 'Manage personal milestone chapters & chronological events',
          playableRoute: '/games/life-story',
          themeColor: 'text-[#E11D48]',
          badgeBg: 'bg-[#FDEEF1]',
        };
      default:
        return {
          title: 'Game Configuration',
          subtitle: 'Manage game settings and personalized content',
          playableRoute: '/games',
          themeColor: 'text-[#0D5C4D]',
          badgeBg: 'bg-[#EAF6F4]',
        };
    }
  };

  const meta = getGameMeta();

  return (
    <MobileContainer showTopBar={false}>
      <div className="flex flex-col min-h-full bg-[#FAF7F2]">
        {/* Top Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/more')}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Back to More Menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <span className="text-sm font-bold tracking-tight text-slate-900">
            {meta.title}
          </span>

          <button
            type="button"
            onClick={() => navigate(meta.playableRoute)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0D5C4D] text-white text-xs font-bold shadow-xs hover:bg-[#07382E] transition active:scale-95"
            title="Play Game"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play</span>
          </button>
        </div>

        {/* Feedback Toast */}
        {savedToast && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{savedToast}</span>
          </div>
        )}

        <div className="p-5 flex-1 space-y-5 overflow-y-auto">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${meta.badgeBg.replace('bg-', 'bg-')} border border-current ${meta.themeColor}`} />
              <h1 className="text-base font-bold text-slate-900 font-['Outfit']">
                {meta.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              {meta.subtitle}
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 1: WHO IS THIS? (Manage Face Memories)                 */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'who-is-this' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Active Face Content Pool ({memories.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingFace(!isAddingFace)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5C4D] bg-[#EAF6F4] hover:bg-[#DDF0EC] px-3 py-1.5 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingFace ? 'Close Form' : 'Add New Face'}</span>
                </button>
              </div>

              {/* Add New Face Form */}
              {isAddingFace && (
                <form onSubmit={handleAddFace} className="bg-white rounded-3xl p-5 border-2 border-[#0D5C4D]/30 shadow-md space-y-3 animate-fadeIn">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">New Face Entry</h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun (Brother)"
                      value={newFace.personName}
                      onChange={(e) => setNewFace({ ...newFace, personName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g. Brother"
                        value={newFace.relationship}
                        onChange={(e) => setNewFace({ ...newFace, relationship: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 1990"
                        value={newFace.year}
                        onChange={(e) => setNewFace({ ...newFace, year: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Photo URL</label>
                    <input
                      type="text"
                      value={newFace.photoUrl}
                      onChange={(e) => setNewFace({ ...newFace, photoUrl: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0D5C4D] hover:bg-[#07382E] text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Save Face to Game Pool
                  </button>
                </form>
              )}

              {/* List of Face Memories */}
              {isLoadingMemories ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading face pool...</div>
              ) : memories.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-xs text-slate-500">
                  No memories found. Click "Add New Face" above to add your first photo!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft-card flex items-center space-x-3"
                    >
                      <div className="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] max-w-[3.5rem] max-h-[3.5rem] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {mem.photoUrl ? (
                          <img
                            src={mem.photoUrl}
                            alt={mem.personName || 'Face'}
                            className="w-full h-full object-cover block"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {mem.personName}
                        </h4>
                        <span className="text-[11px] text-[#0D5C4D] font-semibold block truncate">
                          {mem.relationship || 'Family'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Active in Game Pool ✓
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 2: FESTIVAL MEMORIES (Select Cultural Pack)            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'festival-memories' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Choose Cultural Festival Pack
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: 'bihu',
                    name: 'Rongali Bihu (Assam)',
                    desc: 'Harvest festival stages: Preparation, Bihu Dance, Traditional Pitha, Community Joy',
                    icon: '🌾',
                    region: 'Assam & Brahmaputra Valley',
                  },
                  {
                    id: 'hornbill',
                    name: 'Hornbill Festival (Nagaland)',
                    desc: 'Festival of festivals: Morung building, Warrior Dance, Folk Songs, Tribal Feast',
                    icon: '🪶',
                    region: 'Nagaland & Kohima',
                  },
                  {
                    id: 'chapchar',
                    name: 'Chapchar Kut (Mizoram)',
                    desc: 'Spring celebration: Bamboo Cheraw Dance, Chai Song, Feast, Traditional Dress',
                    icon: '🌺',
                    region: 'Mizoram & Aizawl',
                  },
                  {
                    id: 'wangala',
                    name: 'Wangala 100 Drums (Meghalaya)',
                    desc: 'Harvest thanksgiving: 100 Dama Drums, Saljong Worship, Folk Dance',
                    icon: '🥁',
                    region: 'Garo Hills, Meghalaya',
                  },
                ].map((pack) => {
                  const isSelected = activeFestivalPack === pack.id;

                  return (
                    <div
                      key={pack.id}
                      onClick={() => handleSaveFestivalPack(pack.id as any)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-soft-card ${
                        isSelected
                          ? 'bg-white border-[#0D5C4D] ring-4 ring-[#0D5C4D]/10'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-2xl flex-shrink-0">
                          {pack.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xs font-bold text-slate-900">{pack.name}</h3>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{pack.desc}</p>
                          <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                            {pack.region}
                          </span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        isSelected ? 'bg-[#0D5C4D] border-[#0D5C4D] text-white' : 'border-slate-200'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 3: MEMORY MATCH (Theme & Grid Size)                    */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'memory-match' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Card Theme
              </h2>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'family', name: 'Family Faces', icon: <Users className="w-4 h-4" /> },
                  { id: 'cultural', name: 'Cultural Items', icon: <Sparkles className="w-4 h-4" /> },
                  { id: 'objects', name: 'Daily Objects', icon: <Layers className="w-4 h-4" /> },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleSaveMatchSettings(th.id as any, matchGridSize)}
                    className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${
                      matchTheme === th.id
                        ? 'bg-[#EAF6F4] border-[#0D5C4D] text-[#0D5C4D] font-bold shadow-xs'
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>{th.icon}</div>
                    <span className="text-xs">{th.name}</span>
                  </button>
                ))}
              </div>

              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 pt-2">
                Grid Card Count
              </h2>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { size: 4, label: '4 Cards (Easy)' },
                  { size: 6, label: '6 Cards (Medium)' },
                  { size: 8, label: '8 Cards (Challenge)' },
                ].map((sz) => (
                  <button
                    key={sz.size}
                    type="button"
                    onClick={() => handleSaveMatchSettings(matchTheme, sz.size)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      matchGridSize === sz.size
                        ? 'bg-[#EAF6F4] border-[#0D5C4D] text-[#0D5C4D] font-bold shadow-xs'
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">{sz.size} Cards</span>
                    <span className="text-[10px] text-slate-400">{sz.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 4: REMEMBER & SPEAK (Photo prompt settings)            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'remember-speak' && (
            <div className="space-y-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Spoken Recall Configuration
              </h3>
              <p className="text-xs text-slate-500">
                The game automatically selects the most recent family photo and extracts location & relation entities for speech analysis.
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F3EEF9] border border-[#E1D5F2] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                <div className="text-xs text-[#6D28D9]">
                  <span className="font-bold block">Live Web Speech Recognition: Enabled</span>
                  <span>Captures voice transcripts in English, Assamese, and Hindi.</span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 5: DAILY LIFE CHALLENGE (Routine Schedule)             */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'daily-life' && (
            <div className="space-y-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Connected Routine Slots
              </h3>
              <div className="space-y-2.5">
                {[
                  { time: '8:00 AM', action: 'Breakfast & Morning Medicine', match: 'Aligned with Reminders DB' },
                  { time: '1:00 PM', action: 'Lunch & Hydration', match: 'Aligned with Reminders DB' },
                  { time: '6:00 PM', action: 'Evening Walk in Garden', match: 'Aligned with Reminders DB' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.time} → {item.action}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{item.match}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* CASE 6: MY LIFE STORY (Milestones)                          */}
          {/* ─────────────────────────────────────────────────────────── */}
          {gameKey === 'life-story' && (
            <div className="space-y-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-soft-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Story Chapters & Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Chapters are synchronized with the Patient's Memory Timeline. Add and edit entries from the Memories tab to expand the narrative recall questions.
              </p>
              <button
                type="button"
                onClick={() => navigate('/memories')}
                className="w-full py-3 rounded-xl bg-[#0D5C4D] text-white font-bold text-xs shadow-xs"
              >
                Go to My Memories Album →
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNavBar activeTab="more" onTabChange={handleTabChange} />
    </MobileContainer>
  );
};

export default GameSetupScreen;
