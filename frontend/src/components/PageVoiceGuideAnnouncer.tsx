import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Volume2, VolumeX } from 'lucide-react';

interface RouteVoiceGuide {
  pattern: RegExp | string;
  en: string;
  hi: string;
  as: string;
  ne?: string;
}

const ROUTE_GUIDANCE: RouteVoiceGuide[] = [
  {
    pattern: /^\/$/,
    en: "Welcome to your Home screen. Here you can start today's memory workout, talk to your voice companion, or check your daily reminders.",
    hi: "होम स्क्रीन पर आपका स्वागत है। यहाँ आप आज का मेमोरी अभ्यास शुरू कर सकते हैं, आवाज़ साथी से बात कर सकते हैं, या दिनचर्या देख सकते हैं।",
    as: "হোম স্ক্ৰীনলৈ স্বাগতম। ইয়াত আপুনি দৈনিক স্মৃতি অনুশীলন কৰিব পাৰে, কথা পাতিব পাৰে, আৰু পুৰণি ফটো চাব পাৰে।",
    ne: "गृह पृष्ठमा स्वागत छ। यहाँ तपाईं दैनिक स्मृति अभ्यास गर्न सक्नुहुन्छ।",
  },
  {
    pattern: /^\/games$/,
    en: "Memory Games Catalog. Choose a joyful game like Who Is This face match, Card pairs, Festival memories, or Remember and Speak.",
    hi: "मेमोरी गेम्स। यहाँ आप चेहरे पहचानिए, कार्ड मैच, और त्योहारों से जुड़े खेल खेल सकते हैं।",
    as: "স্মৃতি খেলৰ তালিকা। ইয়াত মুখ চিনাক্তকৰণ, কাৰ্ড মেচ, আৰু বিহু উৎসৱৰ খেল বাছক।",
  },
  {
    pattern: /^\/games\/who-is-this/,
    en: "Who Is This game. Look at the family photo and choose the correct person or relationship.",
    hi: "चेहरे पहचानिए खेल। पारिवारिक फोटो देखें और सही रिश्तेदार का चुनाव करें।",
    as: "মুখ চিনাক্তকৰণ খেল। ফটো চাই সঠিক সম্পৰ্কটো বাছক।",
  },
  {
    pattern: /^\/games\/memory-match/,
    en: "Memory Match. Tap the cards to flip them and find all matching pairs.",
    hi: "मेमोरी मैच। कार्ड्स पर टैप करें और एक जैसी जोड़ियां खोजें।",
    as: "কাৰ্ড মেচ খেল। কাৰ্ডত টিপি একে ছবিৰ যোৰা মিলাওক।",
  },
  {
    pattern: /^\/games\/festival-memories/,
    en: "Festival Memories. Arrange the Rongali Bihu and cultural celebration steps in the correct order.",
    hi: "त्योहारों की यादें। रोंगाली बिहू उत्सव के चरणों को सही क्रम में लगाएं।",
    as: "উৎসৱৰ স্মৃতি। ৰঙালী বিহুৰ নিয়মসমূহ সঠিক ক্ৰমত সজাওক।",
  },
  {
    pattern: /^\/games\/remember-(?:and-)?speak/,
    en: "Remember and Speak. Listen to the gentle memory story, then press the mic button to speak what you remember.",
    hi: "सुनें और बोलें। कहानी को ध्यान से सुनें, फिर माइक दबाकर उत्तर दें।",
    as: "শুনি কওক। কাহিনীটো মন দি শুনক আৰু মাইকত কওক।",
  },
  {
    pattern: /^\/games\/daily-(?:life|challenge)/,
    en: "Daily Life Challenge. Tap the correct routine step to practice everyday independent living.",
    hi: "दैनिक जीवन गतिविधि। सही दिनचर्या का कदम चुनें।",
    as: "দৈনিক জীৱন কাৰ্যকলাপ। সঠিক নিয়মটো বাছক।",
  },
  {
    pattern: /^\/games\/(?:my-)?life-story|\/life-story/,
    en: "My Life Story. Explore your narrative timeline, family chapters, and lifetime milestones.",
    hi: "मेरी जीवन गाथा। अपने जीवन के महत्वपूर्ण पड़ावों और सुंदर यादों को देखें।",
    as: "মোৰ জীৱন গাঁথা। আপোনাৰ জীৱনৰ সোণালী স্মৃতিসমূহ চাওক।",
  },
  {
    pattern: /^\/reminders/,
    en: "Reminders and Daily Schedule. Here are your morning, afternoon, and evening medicines and tasks.",
    hi: "दैनिक दिनचर्या और दवाइयां। यहाँ आपकी सुबह, दोपहर और शाम की दिनचर्या की सूची है।",
    as: "দৈনিক কাৰ্যসূচী আৰু ঔষধ। আপোনাৰ ঔষধ আৰু নিয়মসমূহ ইয়াত আছে।",
  },
  {
    pattern: /^\/memories/,
    en: "My Memories Album. Tap any family photo or playable video memory to relive cherished moments.",
    hi: "मेरी यादों का एल्बम। किसी भी फोटो या वीडियो पर टैप करके अपनी खूबसूरत यादें देखें और सुनें।",
    as: "মোৰ স্মৃতিৰ এলবাম। ফটো আৰু ভিডিঅ’ চাই পুৰণি দিন মনত পেলাওক।",
  },
  {
    pattern: /^\/talk/,
    en: "Voice Assistant. Tap the green microphone button or type below to talk with your companion.",
    hi: "वॉइस असिस्टेंट। परिवार, दवाओं या यादों के बारे में बात करने के लिए हरे माइक बटन पर टैप करें।",
    as: "ভইচ এচিষ্টেণ্ট। কথা পাতিবলৈ মাইক বুটামত টিপক।",
  },
  {
    pattern: /^\/profile/,
    en: "Patient Profile. View your personal details, preferred language, and emergency contacts.",
    hi: "रोगी प्रोफ़ाइल। अपनी व्यक्तिगत जानकारी और आपातकालीन संपर्क देखें।",
    as: "ৰোগীৰ প্ৰফাইল। আপোনাৰ তথ্য আৰু জৰুৰীকালীন নম্বৰ চাওক।",
  },
  {
    pattern: /^\/more\/games\/.*\/setup/,
    en: "Game Setup. Customise photo sets, difficulty level, and cultural packs for this activity.",
    hi: "खेल विन्यास। इस गतिविधि के लिए फोटो और कठिनाई स्तर सेट करें।",
    as: "খেল ছেটিংছ। খেলৰ কঠিনতা আৰু ফটোসমূহ পৰিচালনা কৰক।",
  },
  {
    pattern: /^\/more/,
    en: "More and Settings. Manage games configuration, accessibility easy mode, and clinical portals.",
    hi: "सेटिंग्स और अधिक विकल्प। खेल विन्यास, आसान मोड, और क्लिनिकल पोर्टल प्रबंधित करें।",
    as: "অধিক ছেটিংছ। সহজ মোড আৰু কাৰিকৰী বিকল্পসমূহ পৰিচালনা কৰক।",
  },
  {
    pattern: /^\/dashboard\/memories\/new/,
    en: "Upload or Record Memory. Add family photos, camera snapshots, or video messages.",
    hi: "यादें अपलोड या रिकॉर्ड करें। मरीज के लिए फोटो या वीडियो संदेश जोड़ें।",
    as: "স্মৃতি আপলোড কৰক। ফটো বা ভিডিঅ’ বাৰ্তা সংৰক্ষণ কৰক।",
  },
  {
    pattern: /^\/dashboard/,
    en: "Caregiver and Clinician Dashboard. Monitoring cognitive stability trends and decline alerts.",
    hi: "केयरगिवर डैशबोर्ड। संज्ञानात्मक स्वास्थ्य रुझान और अलर्ट की निगरानी करें।",
    as: "কেয়াৰগিভাৰ ডেশ্ববৰ্ড। স্বাস্থ্যৰ অগ্ৰগতি আৰু সতৰ্কবাণী চাওক।",
  },
  {
    pattern: /^\/asha/,
    en: "ASHA Field Worker Portal. High-contrast view for community health workers to track assigned patients.",
    hi: "आशा कार्यकर्ता पोर्टल। गांव के मरीजों के लिए फील्ड पोर्टल।",
    as: "আশা কৰ্মী প’ৰ্টেল। স্বাস্থ্য পৰিদৰ্শন আৰু ৰোগীৰ তথ্য।",
  },
  {
    pattern: /^\/offline|\/sync/,
    en: "Offline Mode and Sync Queue. View cached game sessions and sync with the health centre.",
    hi: "ऑफलाइन मोड और सिंक। ऑफलाइन रिकॉर्ड देखें और नेटवर्क मिलने पर सिंक करें।",
    as: "অফলাইন মোড আৰু চিন্ক। ইন্টাৰনেট নথকা সময়ৰ তথ্য সংৰক্ষণ কৰক।",
  },
  {
    pattern: /^\/languages/,
    en: "Choose Language. Select your preferred mother tongue for voice and text.",
    hi: "भाषा चुनें। अपनी पसंदीदा मातृभाषा का चयन करें।",
    as: "ভাষা বাছক। আপোনাৰ পচন্দৰ ভাষা বাছক।",
  },
  {
    pattern: /^\/styleguide/,
    en: "Design Styleguide. Inspecting color tokens and components.",
    hi: "डिज़ाइन स्टाइलगाइड। घटक और रंग पैलेट देखें।",
    as: "ডিজাইন ষ্টাইলগাইড।",
  },
];

export const PageVoiceGuideAnnouncer: React.FC = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const { voiceGuidance, speakText, isSpeaking, stopSpeaking } = useAccessibility();
  const lastAnnouncedPath = useRef<string>('');

  useEffect(() => {
    if (!voiceGuidance) {
      return;
    }

    const path = location.pathname;

    // Avoid duplicate immediate repeat of the exact same path
    if (lastAnnouncedPath.current === path) {
      return;
    }
    lastAnnouncedPath.current = path;

    // Small delay to let page mount and transition smoothly
    const timer = setTimeout(() => {
      const matched = ROUTE_GUIDANCE.find((g) =>
        typeof g.pattern === 'string' ? g.pattern === path : g.pattern.test(path)
      );

      const lang = i18n.language || 'en';
      let instruction = matched ? (matched as any)[lang] || matched.en : `Screen: ${path.replace('/', '')}`;

      speakText(instruction, lang);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname, voiceGuidance, i18n.language, speakText]);

  // If Voice Guidance is active and currently speaking, show a compact floating audio pill
  if (!voiceGuidance || !isSpeaking) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-fadeIn">
      <div className="bg-[#07382E] text-white px-3.5 py-2 rounded-full shadow-2xl border border-emerald-400/40 flex items-center gap-2 text-xs font-bold ring-4 ring-emerald-500/20 select-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
        <span className="hidden sm:inline text-teal-100">Voice Guidance Active</span>
        <button
          type="button"
          onClick={stopSpeaking}
          className="ml-1 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Mute / Stop speech"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PageVoiceGuideAnnouncer;
