"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* =====================================================================
   GALLERY (safe mode)
   Photos ko /public/ folder me rakho: photo1.webp ... photo16.webp
   - Jo photos milengi wahi gallery me dikhengi
   - Ek bhi photo nahi hui to 5 "Insert your photo here" demo slides dikhengi
   ===================================================================== */
const GALLERY_MAX = 16;
const GALLERY_FOLDER = ""; // Empty means root of public folder
const GALLERY_EXT = "webp";
const PLACEHOLDER_COUNT = 5;

const GALLERY_CANDIDATES = Array.from(
  { length: GALLERY_MAX },
  (_, i) => `${GALLERY_FOLDER}/photo${i + 1}.${GALLERY_EXT}`
);

function probeImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* =====================================================================
   CLIENT CONFIG — Rajlakshmi Restaurant (Bansphatak / Godowlia, Varanasi)
   Pure Veg Family Restaurant | K-Shree Guest House (K-Shree Group Unit)
   Contact: Rajat Keshari | D 38/113 Hauz Katora, Bansphatak Rd, Varanasi
   TODO: googleReviewUrl me client ka asli Google write-review link daalna hai
   ===================================================================== */
const CLIENT_CONFIG = {
  clientId: "rajlakshmi_restaurant_01",
  businessName: "Rajlakshmi Restaurant",
  subHeading: "Pure Veg · Thali · South Indian · Parathas",
  tagline: "PURE VEG FAMILY RESTAURANT IN BANSPHATAK, VARANASI",
  description:
    "Located at D 38/113 Hauz Katora on Bansphatak Road near Godowlia (in front of Hari Chasma Wale), Varanasi, Rajlakshmi Restaurant (a K-Shree Group unit) serves fresh 100% pure vegetarian meals including Special Thali, South Indian Thali, Punjabi Thali, Masala Dosa, Idli Sambhar, stuffed Aloo & Paneer Parathas, Paneer Butter Masala, Pav Bhaji, Chole Bhature and sweet Lassi.",
  city: "Varanasi, Uttar Pradesh",
  fullAddress:
    "D 38/113 Hauz Katora, Bansphatak Rd, In Front of Hari Chasma Wale, Godowlia, Varanasi, Uttar Pradesh 221001",
  phone: "+919565918578",
  cleanPhone: "919565918578",
  logoUrl: "/logo.png", // /public/logo.png (na ho to monogram dikhega)
  logoInitials: "RL",
  // TODO: yahan client ka asli Google write-review link replace karna hai
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=REPLACE_WITH_CLIENT_PLACE_ID",
  mapsDirectionUrl:
    "https://www.google.com/maps/search/?api=1&query=Rajlakshmi+Restaurant+D+38+113+Hauz+Katora+Bansphatak+Rd+Varanasi+Uttar+Pradesh",
  // 8 Quick Actions (4 upar: Call, WhatsApp, Save Contact, Directions | 4 niche: Instagram, Facebook, Website, Google Page)
  // Kisi bhi link ko khali "" rakhne par uska button apne aap hide ho jayega
  instagramUrl: "https://www.instagram.com/rajlakshmirestaurant",
  facebookUrl: "https://www.facebook.com/rajlakshmirestaurant",
  websiteUrl: "",
  googlePageUrl:
    "https://www.google.com/maps/search/?api=1&query=Rajlakshmi+Restaurant+Bansphatak+Rd+Varanasi",
  agencyName: "VR Max AI",
  agencyWhatsapp: "918700660097",
  agencyPhoneDisplay: "+91 87006 60097",
  customInstruction:
    "You are an authentic local diner or pilgrim writing an unscripted Google Maps review for Rajlakshmi Restaurant at Hauz Katora, Bansphatak Road near Godowlia in Varanasi. Write like a real human speaking straight from the heart about their pure veg Special Thali, Masala Dosa, stuffed Parathas, Paneer dishes, homely taste, pocket-friendly rates and warm hospitality. Strictly pure vegetarian food only. Never use robotic or repetitive openings.",
  // NOTE: chips ke labels route.js ke CHIPS se bilkul exact same hain
  chips: [
    { label: "All", context: "overall dining experience at Rajlakshmi Restaurant" },
    {
      label: "Pure Veg",
      context: "100% pure vegetarian food and clean hygienic kitchen",
    },
    {
      label: "Special Thali",
      context: "filling Special Thali, Normal Thali, South Indian & Punjabi Thali",
    },
    {
      label: "South Indian",
      context: "crispy Masala Dosa, Idli, Vada Sambhar and Butter Uttapam",
    },
    {
      label: "Stuffed Parathas",
      context: "hot Aloo Paratha, Paneer Paratha, Gobhi Paratha & Ghee Roti",
    },
    {
      label: "Paneer Dishes",
      context: "Paneer Butter Masala, Kadhai Paneer, Shahi Paneer & Mix Veg",
    },
    {
      label: "Snacks & Lassi",
      context: "Pav Bhaji, Chole Bhature, Paneer Pakora, Tea & sweet Lassi",
    },
    {
      label: "Homely Taste",
      context: "comforting ghar-jaisa taste with light balanced spices",
    },
    {
      label: "Pocket Friendly",
      context: "affordable pricing with generous portions and great value",
    },
    {
      label: "Quick Service",
      context: "fast polite service and hot food served promptly",
    },
    {
      label: "Family Friendly",
      context: "peaceful family dining comfortable for elders and pilgrims",
    },
    {
      label: "Bansphatak Varanasi",
      context: "convenient location at Hauz Katora, Bansphatak Rd near Godowlia",
    },
  ],
};

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${CLIENT_CONFIG.businessName}, ${CLIENT_CONFIG.fullAddress}`
)}&output=embed`;

const AGENCY_WA_LINK = `https://wa.me/${
  CLIENT_CONFIG.agencyWhatsapp
}?text=${encodeURIComponent(
  "Hi VR Max AI, I want to get a QR review system for my business."
)}`;

/* =====================================================================
   TYPEWRITER HOOK
   ===================================================================== */
function useTypewriter(fullText, totalMs = 2300) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!fullText) {
      setDisplayText("");
      setIsTyping(false);
      return;
    }

    setDisplayText("");
    setIsTyping(true);

    const COMMA_PAUSE = 90;
    const commas = (fullText.match(/,/g) || []).length;
    const base = Math.min(
      26,
      Math.max(10, (totalMs - commas * COMMA_PAUSE) / fullText.length)
    );

    const times = [];
    let t = 0;

    for (let i = 0; i < fullText.length; i++) {
      t += base;
      times.push(t);
      if (fullText[i] === ",") t += COMMA_PAUSE;
    }

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const elapsed = now - start;
      let n = 0;

      while (n < times.length && times[n] <= elapsed) n++;

      setDisplayText(fullText.slice(0, n));

      if (n >= fullText.length) {
        setIsTyping(false);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [fullText, totalMs]);

  return { displayText, isTyping };
}

/* =====================================================================
   CLIPBOARD HELPER
   ===================================================================== */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback below
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);

    const ok = document.execCommand("copy");
    ta.remove();

    return ok;
  } catch (e) {
    return false;
  }
}

/* =====================================================================
   ROYAL KASHI HOSPITALITY CHIME (Web Audio API)
   Soft temple-bell / brass-platter harmonic welcome chime
   ===================================================================== */
function playHospitalityChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.52, now);
    master.connect(ctx.destination);

    // Warm brass bell harmonics (Sa - Pa - Sa')
    [523.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + idx * 0.085;
      osc.type = idx === 2 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.14, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.58);

      osc.connect(gain);
      gain.connect(master);
      osc.start(startAt);
      osc.stop(startAt + 0.62);
    });

    const played = ctx.state === "running";
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 850);
    return played;
  } catch (e) {
    return false;
  }
}

export default function RajlakshmiReviewPage() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introServed, setIntroServed] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const soundPlayedRef = useRef(false);

  const [selectedLabels, setSelectedLabels] = useState(["All"]);
  const firstRunRef = useRef(true);
  const [language, setLanguage] = useState("ENGLISH");
  const [reviewDraft, setReviewDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  // Gallery state
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const galleryTouchStartXRef = useRef(0);

  const isDemoGallery = galleryPhotos.length === 0;
  const slideCount = isDemoGallery ? PLACEHOLDER_COUNT : galleryPhotos.length;

  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const recentLengthsRef = useRef([]);

  const { displayText, isTyping } = useTypewriter(reviewDraft);

  useEffect(() => {
    setMounted(true);

    return () => {
      requestIdRef.current++;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Opening-only 2.2-Second "Welcome to Rajlakshmi Restaurant" Pure Veg Thali Intro
  useEffect(() => {
    if (!mounted) return;

    const triggerSoundOnce = () => {
      if (soundPlayedRef.current) return;
      const ok = playHospitalityChime();
      if (ok) soundPlayedRef.current = true;
    };

    const serveTimer = window.setTimeout(() => {
      setIntroServed(true);
      triggerSoundOnce();
    }, 320);

    const fadeTimer = window.setTimeout(() => {
      setIntroFading(true);
    }, 1850);

    const hideTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 2250);

    const onFirstTouch = () => {
      if (!soundPlayedRef.current) {
        playHospitalityChime();
        soundPlayedRef.current = true;
      }
      window.removeEventListener("pointerdown", onFirstTouch);
    };
    window.addEventListener("pointerdown", onFirstTouch, { passive: true });

    return () => {
      window.clearTimeout(serveTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("pointerdown", onFirstTouch);
    };
  }, [mounted]);

  // Check which gallery photos actually exist in /public
  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    Promise.all(GALLERY_CANDIDATES.map(probeImage)).then((results) => {
      if (cancelled) return;
      setGalleryPhotos(results.filter(Boolean));
      setGalleryIndex(0);
    });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  // Gallery automatic sliding - every 3 seconds
  useEffect(() => {
    if (!mounted || slideCount < 2) return;

    const galleryTimer = window.setInterval(() => {
      setGalleryIndex((current) => (current + 1) % slideCount);
    }, 3000);

    return () => window.clearInterval(galleryTimer);
  }, [mounted, slideCount]);

  // Manual touch swipe
  function handleGalleryTouchStart(event) {
    galleryTouchStartXRef.current = event.changedTouches[0].clientX;
  }

  function handleGalleryTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const difference = galleryTouchStartXRef.current - touchEndX;

    if (Math.abs(difference) < 45) return;

    if (difference > 0) {
      setGalleryIndex((current) => (current + 1) % slideCount);
    } else {
      setGalleryIndex((current) => (current - 1 + slideCount) % slideCount);
    }
  }

  function handleGalleryPrevious() {
    setGalleryIndex((current) => (current - 1 + slideCount) % slideCount);
  }

  function handleGalleryNext() {
    setGalleryIndex((current) => (current + 1) % slideCount);
  }

  const generateAIReview = useCallback(async (labels, lang) => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setCopied(false);
    setError("");
    setNotice("");
    setReviewDraft("");

    try {
      const effectiveFocus = labels.join(" + ");

      const res = await fetch("/api/reviews", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          businessName: CLIENT_CONFIG.businessName,
          category: CLIENT_CONFIG.tagline,
          description: CLIENT_CONFIG.description,
          city: CLIENT_CONFIG.city,
          selectedService: effectiveFocus,
          selectedChips: labels,
          customInstruction: CLIENT_CONFIG.customInstruction,
          language: lang,
          nonce: Math.random().toString(36).substring(2, 12),
          timestamp: Date.now(),
          randomSeed: Math.floor(Math.random() * 100000),
          recentLengths: recentLengthsRef.current,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || `Draft generation failed (${res.status}).`
        );
      }

      if (!data.review?.trim()) {
        throw new Error("The API returned an empty draft.");
      }

      if (requestId !== requestIdRef.current) return;

      if (data.meta) {
        recentLengthsRef.current = [
          ...recentLengthsRef.current,
          data.meta,
        ].slice(-6);
      }

      setReviewDraft(data.review.trim());
    } catch (err) {
      if (err.name === "AbortError") return;

      if (requestId === requestIdRef.current) {
        setError(err.message || "Unable to generate a draft.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const delay = firstRunRef.current ? 0 : 350;
    firstRunRef.current = false;

    const t = setTimeout(
      () => generateAIReview(selectedLabels, language),
      delay
    );

    return () => {
      clearTimeout(t);
      abortControllerRef.current?.abort();
    };
  }, [mounted, selectedLabels, language, generateAIReview]);

  function handleChipChange(chipObj) {
    if (chipObj.label === "All") {
      if (selectedLabels.length === 1 && selectedLabels[0] === "All") {
        generateAIReview(["All"], language);
      } else {
        setSelectedLabels(["All"]);
      }
      return;
    }

    let next = selectedLabels.filter((l) => l !== "All");

    if (next.includes(chipObj.label)) {
      next = next.filter((l) => l !== chipObj.label);
    } else {
      next = [...next, chipObj.label];

      if (next.length > 3) {
        next = next.slice(-3);
      }
    }

    setSelectedLabels(next.length ? next : ["All"]);
  }

  function handleLanguageChange(lang) {
    if (lang === language) {
      generateAIReview(selectedLabels, lang);
      return;
    }

    setLanguage(lang);
  }

  async function handleCopyAndRedirect() {
    if (!reviewDraft || loading || isTyping) return;

    const ok = await copyToClipboard(reviewDraft);

    if (!ok) {
      setError(
        "Could not copy the draft. Please select and copy it manually."
      );
      return;
    }

    setCopied(true);

    if (!CLIENT_CONFIG.googleReviewUrl) {
      setNotice("Review copied. Google review link is not set yet.");
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    setTimeout(() => {
      window.location.href = CLIENT_CONFIG.googleReviewUrl;
    }, 550);
  }

  function handleSaveContact() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${CLIENT_CONFIG.businessName}
ORG:${CLIENT_CONFIG.businessName}
TEL;TYPE=CELL:${CLIENT_CONFIG.phone}
ADR;TYPE=WORK:;;${CLIENT_CONFIG.fullAddress};;;;
NOTE:${CLIENT_CONFIG.subHeading}
END:VCARD`;

    const blob = new Blob([vcard], {
      type: "text/vcard;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${CLIENT_CONFIG.businessName.replace(/[^A-Za-z0-9]+/g, "_")}.vcf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#7a141c",
        }}
      />
    );
  }

  return (
    <main className="soft-luxury-viewport">
      {/* =========================================
          OPENING-ONLY 2.2-SECOND FOOD HOSPITALITY INTRO
          Top Title: "Welcome to Rajlakshmi Restaurant"
          3D Royal Brass Veg Thali + Rising Warm Food Steam + Cloche Lift
          ========================================= */}
      {showIntro && (
        <div
          className={`food-intro-overlay ${introServed ? "served" : ""} ${
            introFading ? "fading" : ""
          }`}
          onClick={() => {
            setIntroServed(true);
            playHospitalityChime();
            soundPlayedRef.current = true;
          }}
          role="presentation"
        >
          <div className="food-intro-glow" aria-hidden="true"></div>

          <div className="food-intro-card">
            {/* Top Welcome Title */}
            <div className="food-welcome-header">
              <span className="food-welcome-eyebrow">WELCOME TO</span>
              <h2 className="food-welcome-title">
                {CLIENT_CONFIG.businessName}
              </h2>
              <span className="food-welcome-sub">
                100% Pure Veg Family Dining • Varanasi
              </span>
            </div>

            {/* 3D Royal Brass Thali & Rising Garam Steam Illustration */}
            <div className="thali-3d-stage" aria-hidden="true">
              <span className="thali-halo-ring ring-outer"></span>
              <span className="thali-halo-ring ring-inner"></span>

              {/* Rising warm aromatic steam wisps */}
              <div className="thali-steam-group">
                <svg
                  className="steam-wisp wisp-1"
                  viewBox="0 0 24 64"
                  width="18"
                  height="52"
                  fill="none"
                >
                  <path
                    d="M12 58C6 46 18 36 12 24C6 14 15 6 12 2"
                    stroke="#ffe5a3"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  className="steam-wisp wisp-2"
                  viewBox="0 0 24 64"
                  width="20"
                  height="58"
                  fill="none"
                >
                  <path
                    d="M12 60C18 48 6 36 12 24C18 12 9 6 12 2"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  className="steam-wisp wisp-3"
                  viewBox="0 0 24 64"
                  width="18"
                  height="52"
                  fill="none"
                >
                  <path
                    d="M12 58C7 46 17 34 11 22C6 12 15 6 12 2"
                    stroke="#ffe5a3"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 3D Shahi Brass Thali Platter with Katoris, Pooris, Rice & Sweet */}
              <div className="thali-platter-wrap">
                <svg
                  viewBox="0 0 220 150"
                  width="205"
                  height="140"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="brassRim3d"
                      x1="20"
                      y1="45"
                      x2="200"
                      y2="135"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#fff2c2" />
                      <stop offset="35%" stopColor="#e6b655" />
                      <stop offset="72%" stopColor="#a8731a" />
                      <stop offset="100%" stopColor="#633e06" />
                    </linearGradient>
                    <radialGradient
                      id="thaliInnerGold"
                      cx="50%"
                      cy="45%"
                      r="55%"
                    >
                      <stop offset="0%" stopColor="#fff8e0" />
                      <stop offset="65%" stopColor="#edd08a" />
                      <stop offset="100%" stopColor="#c49032" />
                    </radialGradient>
                    <linearGradient
                      id="katoriMetal"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#fff5d6" />
                      <stop offset="100%" stopColor="#b98122" />
                    </linearGradient>
                  </defs>

                  {/* Soft table shadow */}
                  <ellipse
                    cx="110"
                    cy="126"
                    rx="86"
                    ry="14"
                    fill="#2b0407"
                    opacity="0.62"
                  />

                  {/* Outer 3D Brass Thali Rim */}
                  <ellipse
                    cx="110"
                    cy="96"
                    rx="92"
                    ry="38"
                    fill="url(#brassRim3d)"
                    stroke="#fff0be"
                    strokeWidth="1.5"
                  />
                  {/* Inner Thali Plate Bed */}
                  <ellipse
                    cx="110"
                    cy="94"
                    rx="80"
                    ry="31"
                    fill="url(#thaliInnerGold)"
                  />

                  {/* Katori 1: Paneer Sabzi (Top Left) */}
                  <ellipse
                    cx="78"
                    cy="81"
                    rx="17"
                    ry="8"
                    fill="url(#katoriMetal)"
                    stroke="#7a4c08"
                    strokeWidth="1"
                  />
                  <ellipse cx="78" cy="80" rx="14" ry="5.8" fill="#d95d1e" />
                  <circle cx="75" cy="79" r="1.8" fill="#fff7ed" />
                  <circle cx="81" cy="80.5" r="1.5" fill="#4d7c0f" />

                  {/* Katori 2: Dal Tadka (Top Center) */}
                  <ellipse
                    cx="110"
                    cy="76"
                    rx="18"
                    ry="8.5"
                    fill="url(#katoriMetal)"
                    stroke="#7a4c08"
                    strokeWidth="1"
                  />
                  <ellipse cx="110" cy="75" rx="14.5" ry="6" fill="#eab308" />
                  <path
                    d="M106 74.5C109 73 112 76 115 74"
                    stroke="#b91c1c"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />

                  {/* Katori 3: Raita / Chutney (Top Right) */}
                  <ellipse
                    cx="142"
                    cy="81"
                    rx="17"
                    ry="8"
                    fill="url(#katoriMetal)"
                    stroke="#7a4c08"
                    strokeWidth="1"
                  />
                  <ellipse cx="142" cy="80" rx="14" ry="5.8" fill="#fefce8" />
                  <circle cx="142" cy="79.5" r="2" fill="#15803d" />

                  {/* Jeera Rice Mound (Bottom Left) */}
                  <path
                    d="M62 104C65 92 89 92 92 104C86 109 68 109 62 104Z"
                    fill="#ffffff"
                    stroke="#e5d5b5"
                    strokeWidth="1"
                  />
                  <circle cx="74" cy="98" r="1" fill="#78350f" />
                  <circle cx="80" cy="100" r="1" fill="#78350f" />
                  <circle cx="77" cy="95" r="1.5" fill="#16a34a" />

                  {/* Hot Ghee Rotis / Parathas (Bottom Right) */}
                  <ellipse
                    cx="134"
                    cy="103"
                    rx="23"
                    ry="10"
                    fill="#d99b43"
                    stroke="#92400e"
                    strokeWidth="1"
                  />
                  <ellipse
                    cx="131"
                    cy="100"
                    rx="22"
                    ry="9.5"
                    fill="#f3c677"
                    stroke="#b45309"
                    strokeWidth="1"
                  />
                  <circle cx="126" cy="99" r="1.4" fill="#92400e" opacity="0.6" />
                  <circle cx="136" cy="101" r="1.6" fill="#92400e" opacity="0.55" />

                  {/* Center Sweet / Gulab Jamun Bowl */}
                  <ellipse
                    cx="105"
                    cy="108"
                    rx="12"
                    ry="6"
                    fill="url(#katoriMetal)"
                  />
                  <circle cx="105" cy="106" r="4.5" fill="#7c2d12" />
                  <circle cx="103.5" cy="104.5" r="1.2" fill="#fed7aa" opacity="0.7" />
                </svg>
              </div>
            </div>

            <div className="food-intro-pill">
              <span className="food-pill-dot"></span>
              <span>FRESH THALI • DOSA • PARATHAS</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RICH BANARASI CRIMSON-RED BACKGROUND (GPU-Isolated & Smooth)
          - Full Royal Crimson-Red velvet gradient
          - Floating warm golden ambient glow orbs
          - Subtle golden lotus/mandala spice rings
          - Gently drifting warm culinary aroma waves
          ========================================= */}
      <div className="fixed-bg" aria-hidden="true">
        <span className="bg-orb bg-orb-one"></span>
        <span className="bg-orb bg-orb-two"></span>

        {/* Top-left subtle golden mandala/platter ring */}
        <svg className="bg-mandala bg-mandala-top" viewBox="0 0 200 200" fill="none">
          <circle
            cx="100"
            cy="100"
            r="86"
            stroke="#f5ce7a"
            strokeWidth="1.2"
            strokeDasharray="10 10"
          />
          <circle cx="100" cy="100" r="62" stroke="#ffd98e" strokeWidth="1" />
          <circle
            cx="100"
            cy="100"
            r="34"
            stroke="#f5ce7a"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
        </svg>

        {/* Bottom-right subtle golden mandala/platter ring */}
        <svg
          className="bg-mandala bg-mandala-bottom"
          viewBox="0 0 220 220"
          fill="none"
        >
          <circle
            cx="110"
            cy="110"
            r="94"
            stroke="#f5ce7a"
            strokeWidth="1.2"
            strokeDasharray="12 12"
          />
          <circle cx="110" cy="110" r="66" stroke="#ffd98e" strokeWidth="1" />
        </svg>

        {/* Subtle golden aroma waves */}
        <svg
          className="bg-aroma-svg"
          viewBox="0 0 420 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g stroke="#f5ce7a" strokeWidth="1.2" opacity="0.24">
            <path d="M-20 170Q110 130 220 170T440 170" />
            <path d="M-20 490Q110 450 220 490T440 490" />
            <path d="M-20 790Q110 750 220 790T440 790" />
          </g>
          <g stroke="#ffe094" strokeWidth="2" strokeLinecap="round" opacity="0.45">
            <path
              className="bg-aroma-beam"
              d="M-20 170Q110 130 220 170T440 170"
            />
            <path
              className="bg-aroma-beam aroma-alt"
              d="M-20 490Q110 450 220 490T440 490"
            />
            <path
              className="bg-aroma-beam aroma-slow"
              d="M-20 790Q110 750 220 790T440 790"
            />
          </g>
        </svg>
      </div>

      <div className="main-content-flow">
        {/* Logo */}
        <div className="brand-medallion-badge">
          <div
            className="logo-circle-container"
            role="img"
            aria-label={`${CLIENT_CONFIG.businessName} logo`}
          >
            {!logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={CLIENT_CONFIG.logoUrl}
                alt=""
                className="logo-img"
                onError={() => setLogoFailed(true)}
                draggable={false}
              />
            ) : (
              <span className="logo-monogram">
                {CLIENT_CONFIG.logoInitials}
              </span>
            )}
          </div>

          <h1 className="brand-main-title">{CLIENT_CONFIG.businessName}</h1>
        </div>

        <p className="brand-serif-subtitle">{CLIENT_CONFIG.subHeading}</p>

        {/* Pure Veg Culinary Divider */}
        <div className="royal-shahi-divider">
          <span className="divider-line"></span>
          <span className="divider-veg-badge" aria-hidden="true">
            <span className="veg-dot"></span>
          </span>
          <span className="divider-line"></span>
        </div>

        <div className="stars-cluster" aria-hidden="true">
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className="experience-tracker-title">SHARE YOUR EXPERIENCE</p>

        {/* Filter Chips */}
        <div className="floating-pills-cloud">
          {CLIENT_CONFIG.chips.map((chip) => {
            const active = selectedLabels.includes(chip.label);

            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipChange(chip)}
                aria-pressed={active}
                className={`embossed-pill ${active ? "active" : ""}`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <p className="chip-hint">Tap up to 3 keywords for your review</p>

        {/* Language Selector */}
        <div className="capsule-lang-dock">
          {["ENGLISH", "HINGLISH"].map((lang) => {
            const active = language === lang;

            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                aria-pressed={active}
                className={`capsule-lang-btn ${active ? "active" : ""}`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* Review Box with Universal Animated Waiting Loader */}
        <div className="signature-review-box">
          <div className="box-top-ribbon">
            <div className="label-badge">
              <span className="dot-ping"></span>
              YOUR REVIEW
            </div>

            <button
              type="button"
              disabled={loading || isTyping}
              onClick={() => generateAIReview(selectedLabels, language)}
              className="top-rewrite-btn"
            >
              <span>Rewrite</span>
            </button>
          </div>

          <div className="review-display-zone">
            {loading ? (
              <div className="ai-loader-stage" role="status" aria-live="polite">
                <div className="ai-loader-lines" aria-hidden="true">
                  <span className="ai-skel-line line-1"></span>
                  <span className="ai-skel-line line-2"></span>
                  <span className="ai-skel-line line-3"></span>
                  <span className="ai-writing-nib">
                    <svg
                      viewBox="0 0 24 24"
                      width="17"
                      height="17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle
                        cx="11"
                        cy="11"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </span>
                </div>
                <div className="ai-loader-status">
                  <span className="ai-spark-pulse" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="currentColor"
                    >
                      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z" />
                    </svg>
                  </span>
                  <span className="ai-status-text">Writing your review</span>
                  <span className="ai-typing-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            ) : error ? (
              <p className="review-error">{error}</p>
            ) : reviewDraft ? (
              <p className="review-body-text">
                {displayText}
                {isTyping && <span className="typewriter-cursor"></span>}
              </p>
            ) : (
              <p className="review-placeholder">
                Your review draft will appear here.
              </p>
            )}
          </div>

          <div className="card-ornament-center">
            <span>◆</span>
          </div>

          <button
            type="button"
            disabled={loading || isTyping || !reviewDraft}
            onClick={handleCopyAndRedirect}
            className={`full-luxury-copy-btn ${copied ? "copied" : ""}`}
          >
            <span>
              {copied
                ? CLIENT_CONFIG.googleReviewUrl
                  ? "Copied! Opening Google..."
                  : "Copied!"
                : "Copy & Paste on Google"}
            </span>
          </button>

          <p className="card-disclaimer-note">
            {notice || "Please review the wording before posting."}
          </p>
        </div>

        {/* =========================================
            QUICK ACTIONS (8 SCULPTED 3D CREAM-GOLD BUTTONS: 4 + 4)
            ========================================= */}
        <div className="quick-actions-card">
          <div className="soft-action-grid">
            <div className="action-row-upper">
              {/* 1. Call */}
              {CLIENT_CONFIG.phone?.trim() && (
                <a
                  href={`tel:${CLIENT_CONFIG.phone.trim()}`}
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.2 16.6v2.7a1.9 1.9 0 0 1-2.1 1.9 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6 18.6 18.6 0 0 1-2.9-8.1A1.9 1.9 0 0 1 4.4 2.5h2.7a1.9 1.9 0 0 1 1.9 1.6c.1.9.3 1.8.7 2.6a1.9 1.9 0 0 1-.4 2l-1.1 1.1a15 15 0 0 0 5.6 5.6l1.1-1.1a1.9 1.9 0 0 1 2-.4c.8.3 1.7.6 2.6.7a1.9 1.9 0 0 1 1.7 2z" />
                    </svg>
                  </div>
                  <span className="icon-tag">Call</span>
                </a>
              )}

              {/* 2. WhatsApp */}
              {CLIENT_CONFIG.cleanPhone?.trim() && (
                <a
                  href={`https://wa.me/${CLIENT_CONFIG.cleanPhone.trim()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z" />
                      <g transform="translate(12 11.7) scale(0.46) translate(-12 -12)">
                        <path
                          fill="currentColor"
                          style={{ stroke: "none" }}
                          d="M21.2 16.6v2.7a1.9 1.9 0 0 1-2.1 1.9 18.6 18.6 0 0 1-8.1-2.9 18.3 18.3 0 0 1-5.6-5.6 18.6 18.6 0 0 1-2.9-8.1A1.9 1.9 0 0 1 4.4 2.5h2.7a1.9 1.9 0 0 1 1.9 1.6c.1.9.3 1.8.7 2.6a1.9 1.9 0 0 1-.4 2l-1.1 1.1a15 15 0 0 0 5.6 5.6l1.1-1.1a1.9 1.9 0 0 1 2-.4c.8.3 1.7.6 2.6.7a1.9 1.9 0 0 1 1.7 2z"
                        />
                      </g>
                    </svg>
                  </div>
                  <span className="icon-tag">WhatsApp</span>
                </a>
              )}

              {/* 3. Save Contact */}
              {CLIENT_CONFIG.phone?.trim() && (
                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9.5" cy="7.5" r="3.8" />
                      <path d="M2.8 20.2v-1.4a4.8 4.8 0 0 1 4.8-4.8h3.8a4.8 4.8 0 0 1 4.8 4.8v1.4" />
                      <path d="M19.5 7.5v5.4M16.8 10.2h5.4" />
                    </svg>
                  </div>
                  <span className="icon-tag">Save Contact</span>
                </button>
              )}

              {/* 4. Directions */}
              {CLIENT_CONFIG.mapsDirectionUrl?.trim() && (
                <a
                  href={CLIENT_CONFIG.mapsDirectionUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 21s-6.8-5.6-6.8-11.2a6.8 6.8 0 1 1 13.6 0C18.8 15.4 12 21 12 21z" />
                      <circle cx="12" cy="9.8" r="2.6" />
                    </svg>
                  </div>
                  <span className="icon-tag">Directions</span>
                </a>
              )}
            </div>

            <div className="action-row-lower">
              {/* 5. Instagram */}
              {CLIENT_CONFIG.instagramUrl?.trim() && (
                <a
                  href={CLIENT_CONFIG.instagramUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
                      <circle cx="12" cy="12" r="4.2" />
                      <circle
                        cx="17.4"
                        cy="6.6"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </div>
                  <span className="icon-tag">Instagram</span>
                </a>
              )}

              {/* 6. Facebook */}
              {CLIENT_CONFIG.facebookUrl?.trim() && (
                <a
                  href={CLIENT_CONFIG.facebookUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.5 3h-2.8a4.7 4.7 0 0 0-4.7 4.7v2.8H7v3.6h3V21h3.7v-6.9h3l.8-3.6h-3.8V7.8c0-.7.5-1.2 1.2-1.2h2.6V3z" />
                    </svg>
                  </div>
                  <span className="icon-tag">Facebook</span>
                </a>
              )}

              {/* 7. Website */}
              {CLIENT_CONFIG.websiteUrl?.trim() && (
                <a
                  href={CLIENT_CONFIG.websiteUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9.5" />
                      <path d="M2.5 12h19" />
                      <path d="M12 2.5a14.5 14.5 0 0 1 3.8 9.5A14.5 14.5 0 0 1 12 21.5 14.5 14.5 0 0 1 8.2 12 14.5 14.5 0 0 1 12 2.5z" />
                    </svg>
                  </div>
                  <span className="icon-tag">Website</span>
                </a>
              )}

              {/* 8. Google Page */}
              {CLIENT_CONFIG.googlePageUrl?.trim() && (
                <a
                  href={CLIENT_CONFIG.googlePageUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="soft-circle-action"
                >
                  <div className="icon-disc">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.945 11a9 9 0 1 1-3.284-5.997l-2.655 2.392A5.5 5.5 0 1 0 17.125 14H13v-3h7.945z" />
                    </svg>
                  </div>
                  <span className="icon-tag">Google Page</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            PHOTO GALLERY
            ========================================= */}
        <section
          className="cafe-gallery-section"
          aria-label="Restaurant photo gallery"
        >
          <div className="gallery-heading">
            <span className="gallery-eyebrow">
              A TASTE OF RAJLAKSHMI RESTAURANT
            </span>

            <h2 className="gallery-title">Explore Our Dining & Menu</h2>

            <p className="gallery-subtitle">
              Special Thali, Masala Dosa, Stuffed Parathas & Paneer
            </p>
          </div>

          <div
            className="gallery-slider"
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
            onTouchCancel={() => {
              galleryTouchStartXRef.current = 0;
            }}
          >
            <div
              className="gallery-track"
              style={{
                transform: `translate3d(-${galleryIndex * 100}%, 0, 0)`,
              }}
            >
              {isDemoGallery
                ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
                    <div
                      className="gallery-slide"
                      key={`gallery-placeholder-${index + 1}`}
                    >
                      <div className="gallery-image-frame gallery-placeholder-frame">
                        <div className="gallery-placeholder-inner">
                          <div className="gallery-placeholder-icon">
                            <svg
                              viewBox="0 0 24 24"
                              width="26"
                              height="26"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                          <p className="gallery-placeholder-title">
                            Insert your photo here
                          </p>
                          <p className="gallery-placeholder-hint">
                            Photo {index + 1} • add photo{index + 1}.
                            {GALLERY_EXT} in public folder
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                : galleryPhotos.map((src, index) => (
                    <div
                      className="gallery-slide"
                      key={`gallery-photo-${index + 1}`}
                    >
                      <div className="gallery-image-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${CLIENT_CONFIG.businessName} gallery photo ${index + 1}`}
                          className="gallery-real-img"
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                    </div>
                  ))}
            </div>

            <button
              type="button"
              className="gallery-arrow gallery-arrow-left"
              onClick={handleGalleryPrevious}
              aria-label="Previous gallery photo"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              className="gallery-arrow gallery-arrow-right"
              onClick={handleGalleryNext}
              aria-label="Next gallery photo"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="gallery-bottom-controls">
            <div className="gallery-dots" aria-label="Gallery slides">
              {Array.from({ length: slideCount }).map((_, index) => (
                <button
                  key={`gallery-dot-${index + 1}`}
                  type="button"
                  className={`gallery-dot ${
                    galleryIndex === index ? "active" : ""
                  }`}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={galleryIndex === index ? "true" : undefined}
                />
              ))}
            </div>

            <span className="gallery-counter">
              {String(galleryIndex + 1).padStart(2, "0")}
              <span className="gallery-counter-divider"> / </span>
              {String(slideCount).padStart(2, "0")}
            </span>
          </div>
        </section>

        {/* Map Card */}
        <div className="embedded-map-card">
          <a
            href={CLIENT_CONFIG.mapsDirectionUrl}
            target="_blank"
            rel="noreferrer"
            className="map-card-header-link"
          >
            <div className="address-highlight-box">
              <p className="agency-clean-address">
                <strong>Address:</strong> {CLIENT_CONFIG.fullAddress}
              </p>
            </div>

            <div className="map-card-header">
              <span>Visit Us • Bansphatak Rd, Varanasi</span>
            </div>
          </a>

          <div className="map-iframe-container">
            <iframe
              title={`${CLIENT_CONFIG.businessName} Location`}
              src={MAP_EMBED_URL}
              width="100%"
              height="170"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <a
            href={CLIENT_CONFIG.mapsDirectionUrl}
            target="_blank"
            rel="noreferrer"
            className="map-directions-link"
          >
            Get Directions on Google Maps &rarr;
          </a>
        </div>

        {/* Mini Footer */}
        <footer className="mini-footer">
          <span className="mini-footer-pill">
            Powered by <strong>{CLIENT_CONFIG.agencyName}</strong>
            <span className="mini-footer-dot">•</span>
            Get QR:
            <a href={AGENCY_WA_LINK} target="_blank" rel="noreferrer">
              {CLIENT_CONFIG.agencyPhoneDisplay}
            </a>
          </span>
        </footer>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

        /* =========================================
           RAJLAKSHMI RESTAURANT — BANSPHATAK, VARANASI
           RICH BANARASI CRIMSON-RED BACKDROP + WARM IVORY CARDS + ROYAL BRASS GOLD 3D
           ========================================= */

        :root {
          --brand: #9e1b24;
          --brand-dark: #4a0a10;
          --brand-light: #fdf2ec;
          --gold: #c98c24;
          --gold-soft: #e6b85c;
          --ink: #2b1815;
          --muted: #7a5c56;
          --border: rgba(236, 184, 88, 0.34);
          --line: #edd8c8;
          --surface: rgba(255, 251, 245, 0.96);
          --shadow: 0 14px 36px rgba(48, 5, 10, 0.32);
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #7a141c !important;
          min-height: 100% !important;
          overflow-x: hidden !important;
          -webkit-font-smoothing: antialiased;
        }

        /* =========================================
           FULL BANARASI CRIMSON-RED BACKGROUND (GPU-Isolated)
           ========================================= */

        .fixed-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          height: 100lvh;
          overflow: hidden;

          background:
            radial-gradient(ellipse at 50% 0%, #b8232e 0%, transparent 55%),
            radial-gradient(ellipse at 12% 45%, #9e1922 0%, transparent 48%),
            radial-gradient(ellipse at 88% 75%, #8a141d 0%, transparent 50%),
            linear-gradient(165deg, #961822 0%, #781119 52%, #590a11 100%);

          z-index: 0;
          pointer-events: none;

          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          contain: strict;
        }

        /* Subtle Banarasi golden motif dots */
        .fixed-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(255, 218, 138, 0.14) 1px,
            transparent 1px
          );
          background-size: 26px 26px;
        }

        .bg-orb {
          position: absolute;
          width: 390px;
          height: 390px;
          border-radius: 50%;
          opacity: 0.42;
          will-change: transform;
          animation: orbFloat 9.5s ease-in-out infinite alternate;
        }

        .bg-orb-one {
          top: -150px;
          right: -140px;
          background: radial-gradient(
            circle,
            rgba(246, 194, 94, 0.55) 0%,
            rgba(246, 194, 94, 0.16) 48%,
            transparent 72%
          );
        }

        .bg-orb-two {
          bottom: 4%;
          left: -190px;
          background: radial-gradient(
            circle,
            rgba(235, 132, 92, 0.48) 0%,
            rgba(235, 132, 92, 0.14) 48%,
            transparent 72%
          );
          animation-delay: -4.5s;
        }

        .bg-mandala {
          position: absolute;
          opacity: 0.24;
          will-change: transform;
        }

        .bg-mandala-top {
          width: 195px;
          height: 195px;
          top: 46px;
          left: -78px;
          animation: mandalaSpin 34s linear infinite;
        }

        .bg-mandala-bottom {
          width: 225px;
          height: 225px;
          bottom: 62px;
          right: -88px;
          animation: mandalaSpinReverse 40s linear infinite;
        }

        .bg-aroma-svg {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.48;
          transform: translate3d(0, 0, 0);
        }

        .bg-aroma-beam {
          stroke-dasharray: 46 380;
          animation: aromaGlide 5.4s linear infinite;
        }

        .aroma-alt {
          animation-duration: 6.6s;
          animation-direction: reverse;
        }

        .aroma-slow {
          animation-duration: 7.8s;
        }

        @keyframes aromaGlide {
          to {
            stroke-dashoffset: -426;
          }
        }

        @keyframes mandalaSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes mandalaSpinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes orbFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(18px, 24px, 0) scale(1.08);
          }
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =========================================
           2.2-SECOND FOOD HOSPITALITY INTRO OVERLAY
           "Welcome to Rajlakshmi Restaurant" + 3D Brass Veg Thali + Steam
           ========================================= */

        .food-intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(
            circle at 50% 44%,
            #a81c27 0%,
            #6e0e16 58%,
            #42060b 100%
          );
          opacity: 1;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .food-intro-overlay::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(255, 224, 150, 0.12) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
          pointer-events: none;
        }

        .food-intro-overlay.fading {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        .food-intro-glow {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 206, 108, 0.36) 0%,
            rgba(218, 92, 54, 0.16) 50%,
            transparent 72%
          );
          transform: scale(0.88);
          transition: transform 0.7s ease;
        }

        .food-intro-overlay.served .food-intro-glow {
          transform: scale(1.38);
        }

        .food-intro-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 16px;
        }

        .food-welcome-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          margin-bottom: 10px;
          transform: translateY(10px);
          opacity: 0;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.5s ease;
        }

        .food-intro-overlay.served .food-welcome-header {
          transform: translateY(0);
          opacity: 1;
        }

        .food-welcome-eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3.2px;
          color: #ffe094;
          text-transform: uppercase;
        }

        .food-welcome-title {
          font-family: "Outfit", sans-serif;
          font-size: 26px;
          line-height: 1.15;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 4px 18px rgba(45, 4, 8, 0.55);
        }

        .food-welcome-sub {
          font-size: 11px;
          font-weight: 600;
          color: #fad8b8;
        }

        .thali-3d-stage {
          position: relative;
          width: 240px;
          height: 195px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 14px;
        }

        .thali-halo-ring {
          position: absolute;
          left: 50%;
          top: 62%;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.4);
          opacity: 0;
          pointer-events: none;
        }

        .ring-outer {
          width: 90px;
          height: 90px;
          border: 2px solid rgba(255, 224, 148, 0.78);
        }

        .ring-inner {
          width: 68px;
          height: 68px;
          border: 1.5px solid rgba(255, 255, 255, 0.65);
        }

        .food-intro-overlay.served .ring-outer {
          animation: thaliHalo 1.1s ease-out forwards;
        }

        .food-intro-overlay.served .ring-inner {
          animation: thaliHalo 0.95s ease-out 0.14s forwards;
        }

        @keyframes thaliHalo {
          0% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2.8);
          }
        }

        .thali-steam-group {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: flex-end;
          gap: 14px;
          margin-bottom: -18px;
          pointer-events: none;
        }

        .steam-wisp {
          opacity: 0;
          will-change: transform, opacity;
        }

        .food-intro-overlay.served .wisp-1 {
          animation: steamRise 1.4s ease-in-out infinite;
        }

        .food-intro-overlay.served .wisp-2 {
          animation: steamRise 1.5s ease-in-out 0.25s infinite;
        }

        .food-intro-overlay.served .wisp-3 {
          animation: steamRise 1.4s ease-in-out 0.45s infinite;
        }

        @keyframes steamRise {
          0% {
            transform: translateY(10px) scaleY(0.85);
            opacity: 0;
          }
          45% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-16px) scaleY(1.1);
            opacity: 0;
          }
        }

        .thali-platter-wrap {
          position: relative;
          z-index: 2;
          transform: translateY(22px) scale(0.86);
          opacity: 0;
          filter: drop-shadow(0 16px 24px rgba(42, 4, 8, 0.6));
          transition: transform 0.65s cubic-bezier(0.22, 1.22, 0.36, 1),
            opacity 0.5s ease;
        }

        .food-intro-overlay.served .thali-platter-wrap {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .food-intro-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 224, 148, 0.45);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #ffe8ad;
        }

        .food-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 10px #4ade80;
        }

        /* =========================================
           MAIN LAYOUT (On Full Crimson-Red Backdrop)
           ========================================= */

        .soft-luxury-viewport {
          position: relative;
          isolation: isolate;
          z-index: 1;
          min-height: 100vh;
          min-height: 100dvh;
          background: transparent;
          padding: 10px 16px 24px;
          box-sizing: border-box;
          font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, sans-serif;
          color: var(--ink);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .main-content-flow {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 410px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .brand-medallion-badge {
          margin-top: 2px;
          margin-bottom: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-circle-container {
          position: relative;
          width: 98px;
          height: 98px;
          border-radius: 50%;
          background: linear-gradient(145deg, #fff5d6, #e5b34b 55%, #a87116);
          overflow: visible;
          display: grid;
          place-items: center;
          margin: 8px 0 20px;
          will-change: transform;
          animation: floatLogo 3.5s ease-in-out infinite;
          border: 1.5px solid #ffe69e;
          box-shadow:
            0 0 0 5px rgba(255, 250, 240, 0.95),
            0 0 0 6.5px #e6b85c,
            0 14px 28px rgba(38, 4, 8, 0.45),
            inset 0 2px 4px rgba(255, 255, 255, 0.55);
          transition: transform 0.2s ease;
        }

        .logo-circle-container::after {
          content: "";
          position: absolute;
          inset: -13px;
          border: 1px dashed rgba(255, 224, 150, 0.52);
          border-radius: 50%;
          pointer-events: none;
        }

        .logo-circle-container:active {
          transform: scale(0.96);
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
        }

        .logo-monogram {
          font-family: "Outfit", sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #590a11;
        }

        @keyframes floatLogo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -6px, 0);
          }
        }

        .brand-main-title {
          font-family: "Outfit", sans-serif;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 3px;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 12px rgba(45, 4, 8, 0.42);
        }

        .brand-serif-subtitle {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          color: #ffe3a3;
          margin: 0 0 2px;
        }

        .royal-shahi-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76%;
          margin: 0 auto 2px;
          gap: 10px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 224, 148, 0.75),
            transparent
          );
        }

        /* Official Green Pure-Veg Mark */
        .divider-veg-badge {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: #fffdf8;
          border: 1.5px solid #16a34a;
          display: grid;
          place-items: center;
          box-shadow: 0 2px 6px rgba(45, 4, 8, 0.35);
        }

        .veg-dot {
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: #16a34a;
        }

        .stars-cluster {
          display: flex;
          gap: 4px;
          color: #ffd166;
          font-size: 13px;
          line-height: 1;
          margin: 0 0 2px;
          filter: drop-shadow(0 2px 5px rgba(42, 4, 8, 0.45));
        }

        .chip-hint {
          text-align: center;
          font-size: 9.5px;
          color: rgba(255, 238, 222, 0.85);
          margin: 0 0 5px;
        }

        .experience-tracker-title {
          display: inline-block;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #ffe29e;
          text-transform: uppercase;
          margin: 0 auto 7px;
          padding: 0 12px 4px;
          border-bottom: 1px solid rgba(255, 226, 158, 0.42);
        }

        .floating-pills-cloud {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          margin: 0 auto 6px;
          width: 100%;
        }

        /* =========================================
           FILTER CHIPS (Warm Cream-Ivory + Golden Active Glossy 3D)
           ========================================= */

        .embossed-pill {
          position: relative;
          overflow: hidden;
          border-radius: 999px;
          padding: 5.5px 10.5px;
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 400;
          line-height: 1.25;

          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #fdf6ec 58%,
            #f5e6d3 100%
          );
          color: #4a1c1a;
          border: 1px solid rgba(255, 234, 196, 0.85);

          cursor: pointer;

          box-shadow:
            0 4px 9px rgba(45, 4, 8, 0.24),
            0 1.5px 3px rgba(45, 4, 8, 0.14),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(168, 112, 42, 0.14);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease;
        }

        .embossed-pill::after {
          content: "";
          position: absolute;
          top: 1px;
          left: 8px;
          right: 8px;
          height: 45%;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.85),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .embossed-pill:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 12px rgba(45, 4, 8, 0.3),
            0 2px 4px rgba(45, 4, 8, 0.16),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(168, 112, 42, 0.16);
        }

        .embossed-pill:active {
          transform: translateY(1.5px) scale(0.97);
          box-shadow:
            0 1px 3px rgba(45, 4, 8, 0.2),
            inset 0 2px 4px rgba(120, 72, 16, 0.16);
        }

        .embossed-pill.active {
          background: linear-gradient(
            180deg,
            #fff3cc 0%,
            #f7d57c 55%,
            #e3b142 100%
          );
          color: #4d170c;
          font-weight: 400;
          border: 1px solid #ffe7a3;
          box-shadow:
            0 5px 11px rgba(45, 4, 8, 0.32),
            0 1.5px 3px rgba(45, 4, 8, 0.18),
            inset 0 1.5px 1.5px rgba(255, 252, 236, 0.95),
            inset 0 -2px 2.5px rgba(145, 92, 14, 0.24);
        }

        .embossed-pill.active::before {
          content: "✓ ";
          font-weight: 500;
        }

        .embossed-pill.active:active {
          transform: translateY(1.5px) scale(0.97);
          box-shadow:
            0 1px 3px rgba(45, 4, 8, 0.24),
            inset 0 2px 4px rgba(145, 92, 14, 0.24);
        }

        /* =========================================
           LANGUAGE SELECTOR (Warm Cream Dock + Royal Brass Gold 3D)
           ========================================= */

        .capsule-lang-dock {
          display: inline-flex;
          background: linear-gradient(180deg, #fffcf6 0%, #f3e2cc 100%);
          border-radius: 999px;
          padding: 3px;
          gap: 3px;
          margin: 0 auto 9px;
          border: 1px solid rgba(255, 226, 168, 0.85);
          box-shadow:
            0 6px 14px rgba(45, 4, 8, 0.28),
            0 1.5px 3px rgba(45, 4, 8, 0.14),
            inset 0 1.5px 2px rgba(255, 255, 255, 0.96),
            inset 0 -1px 2px rgba(145, 92, 14, 0.12);
        }

        .capsule-lang-btn {
          position: relative;
          overflow: hidden;
          padding: 5.5px 15px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          font-family: inherit;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.6px;
          color: #78483e;
          cursor: pointer;

          transition:
            transform 0.16s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            color 0.2s ease;
        }

        .capsule-lang-btn.active {
          background: linear-gradient(
            180deg,
            #e8b854 0%,
            #c68922 52%,
            #9c6610 100%
          );
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(84, 48, 4, 0.35);
          border-color: #96620f;
          box-shadow:
            0 4px 10px rgba(84, 48, 4, 0.32),
            0 1.5px 3px rgba(45, 4, 8, 0.18),
            inset 0 1.5px 1.5px rgba(255, 248, 224, 0.55),
            inset 0 -2px 2.5px rgba(96, 56, 6, 0.34);
        }

        .capsule-lang-btn.active::after {
          content: "";
          position: absolute;
          top: 1px;
          left: 8px;
          right: 8px;
          height: 45%;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .capsule-lang-btn:active {
          transform: translateY(1.5px) scale(0.97);
        }

        /* =========================================
           SECTION BOXES (Warm Ivory Cards Floating on Crimson Red)
           ========================================= */

        .signature-review-box,
        .quick-actions-card,
        .cafe-gallery-section,
        .embedded-map-card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow), inset 0 1px 0 #ffffff;
          animation: cardAppear 0.65s ease both;
        }

        .signature-review-box::before,
        .quick-actions-card::before,
        .cafe-gallery-section::before,
        .embedded-map-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 18%;
          width: 64%;
          height: 2.5px;
          background: linear-gradient(
            90deg,
            transparent,
            #d4952a,
            #f7d683,
            #d4952a,
            transparent
          );
        }

        /* =========================================
           REVIEW CARD + UNIVERSAL WAITING LOADER
           ========================================= */

        .signature-review-box {
          width: 100%;
          border-radius: 23px;
          padding: 15px 16px;
          box-sizing: border-box;
          margin-bottom: 16px;
          text-align: left;
          color: var(--ink);
          overflow: hidden;
        }

        .box-top-ribbon {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .label-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--brand-dark);
          text-transform: uppercase;
        }

        .dot-ping {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 3px #dcfce7;
        }

        .top-rewrite-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;

          padding: 6px 12px;
          border-radius: 999px;

          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #fdf4e7 58%,
            #f5e1c3 100%
          );
          border: 1px solid #e3c28d;
          color: #8c2328;

          font-family: inherit;
          font-size: 10.5px;
          font-weight: 500;

          cursor: pointer;

          box-shadow:
            0 4px 8px rgba(74, 10, 16, 0.1),
            0 1px 2px rgba(74, 10, 16, 0.05),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(184, 132, 36, 0.14);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .top-rewrite-btn::after {
          content: "";
          position: absolute;
          top: 1px;
          left: 7px;
          right: 7px;
          height: 45%;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.85),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .top-rewrite-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 6px 11px rgba(74, 10, 16, 0.15),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(184, 132, 36, 0.14);
        }

        .top-rewrite-btn:active:not(:disabled) {
          transform: translateY(1.5px) scale(0.97);
          box-shadow:
            0 1px 3px rgba(74, 10, 16, 0.12),
            inset 0 2px 3px rgba(184, 132, 36, 0.18);
        }

        .top-rewrite-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .review-display-zone {
          min-height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px 14px;
          background: #ffffff;
          border: 1px solid #edd9c4;
          border-radius: 14px;
        }

        .ai-loader-stage {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 13px;
          padding: 6px 2px;
        }

        .ai-loader-lines {
          position: relative;
          width: 100%;
          max-width: 290px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .ai-skel-line {
          display: block;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(158, 27, 36, 0.08) 0%,
            rgba(201, 140, 36, 0.34) 48%,
            rgba(158, 27, 36, 0.08) 100%
          );
          background-size: 220% 100%;
          animation: aiLineSweep 1.5s ease-in-out infinite;
        }

        .ai-skel-line.line-1 {
          width: 96%;
          animation-delay: 0s;
        }
        .ai-skel-line.line-2 {
          width: 84%;
          animation-delay: 0.18s;
        }
        .ai-skel-line.line-3 {
          width: 62%;
          animation-delay: 0.36s;
        }

        .ai-writing-nib {
          position: absolute;
          top: -6px;
          left: 0;
          color: var(--brand);
          filter: drop-shadow(0 3px 6px rgba(158, 27, 36, 0.24));
          animation: aiNibWrite 2.2s ease-in-out infinite;
          pointer-events: none;
        }

        .ai-loader-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: var(--brand-light);
          border: 1px solid rgba(201, 140, 36, 0.28);
        }

        .ai-spark-pulse {
          display: inline-flex;
          color: var(--gold);
          animation: aiSparkSpin 1.8s ease-in-out infinite;
        }

        .ai-status-text {
          font-family: "Plus Jakarta Sans", sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: var(--brand);
          letter-spacing: 0.2px;
        }

        .ai-typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-left: 1px;
        }

        .ai-typing-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--gold);
          animation: aiDotBounce 1.1s ease-in-out infinite;
        }

        .ai-typing-dots span:nth-child(2) {
          animation-delay: 0.18s;
        }
        .ai-typing-dots span:nth-child(3) {
          animation-delay: 0.36s;
        }

        @keyframes aiLineSweep {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }

        @keyframes aiNibWrite {
          0% {
            transform: translate3d(18px, 0px, 0) rotate(-6deg);
            opacity: 0.85;
          }
          32% {
            transform: translate3d(210px, 2px, 0) rotate(6deg);
            opacity: 1;
          }
          38% {
            transform: translate3d(28px, 16px, 0) rotate(-6deg);
            opacity: 0.9;
          }
          68% {
            transform: translate3d(195px, 18px, 0) rotate(5deg);
            opacity: 1;
          }
          74% {
            transform: translate3d(34px, 32px, 0) rotate(-6deg);
            opacity: 0.9;
          }
          95% {
            transform: translate3d(150px, 33px, 0) rotate(4deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(18px, 0px, 0) rotate(-6deg);
            opacity: 0.85;
          }
        }

        @keyframes aiSparkSpin {
          0%,
          100% {
            transform: scale(0.88) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.16) rotate(45deg);
            opacity: 1;
          }
        }

        @keyframes aiDotBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-3.5px);
            opacity: 1;
          }
        }

        .review-body-text {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14.5px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--ink);
          margin: 0;
          width: 100%;
          white-space: pre-wrap;
        }

        .review-placeholder {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13.5px;
          font-style: italic;
          color: #9e837c;
          margin: 0;
        }

        .review-error {
          font-size: 12px;
          color: #a61c24;
          margin: 0;
        }

        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 13px;
          background: var(--brand);
          margin-left: 3px;
          vertical-align: middle;
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .card-ornament-center {
          text-align: center;
          color: var(--gold);
          font-size: 7px;
          margin: 6px 0 8px;
        }

        /* =========================================
           MAIN COPY BUTTON (Royal Brass Gold 3D on Ivory Card)
           ========================================= */

        .full-luxury-copy-btn {
          position: relative;
          overflow: hidden;

          width: 100%;
          min-height: 49px;
          border-radius: 15px;

          background: linear-gradient(
            180deg,
            #ebbd5b 0%,
            #c88b22 50%,
            #9d6710 100%
          );
          border: 1px solid #94600e;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(84, 48, 4, 0.38);

          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.25px;
          cursor: pointer;

          box-shadow:
            0 9px 18px rgba(158, 102, 16, 0.32),
            0 3px 6px rgba(74, 10, 16, 0.16),
            inset 0 1.5px 1.5px rgba(255, 248, 224, 0.58),
            inset 0 -2.5px 4px rgba(96, 56, 6, 0.34);

          transition:
            transform 0.16s ease,
            background 0.2s ease,
            box-shadow 0.16s ease,
            opacity 0.18s ease;
        }

        .full-luxury-copy-btn::before {
          content: "";
          position: absolute;
          top: 1px;
          left: 10px;
          right: 10px;
          height: 46%;
          border-radius: 14px 14px 40% 40%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .full-luxury-copy-btn::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 42%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 252, 235, 0.34),
            transparent
          );
          will-change: transform;
          animation: btnShine 3.6s infinite;
        }

        @keyframes btnShine {
          0%,
          55% {
            transform: translate3d(-150%, 0, 0) skewX(-20deg);
          }
          100% {
            transform: translate3d(350%, 0, 0) skewX(-20deg);
          }
        }

        .full-luxury-copy-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 12px 22px rgba(158, 102, 16, 0.38),
            0 4px 8px rgba(74, 10, 16, 0.18),
            inset 0 1.5px 1.5px rgba(255, 250, 232, 0.65),
            inset 0 -2.5px 4px rgba(96, 56, 6, 0.34);
        }

        .full-luxury-copy-btn:active:not(:disabled) {
          transform: translateY(2px) scale(0.99);
          box-shadow:
            0 2px 5px rgba(158, 102, 16, 0.28),
            inset 0 3px 6px rgba(96, 56, 6, 0.32);
        }

        .full-luxury-copy-btn.copied {
          background: linear-gradient(
            180deg,
            #26a65b 0%,
            #198747 52%,
            #116634 100%
          );
          border-color: #106131;
        }

        .full-luxury-copy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .full-luxury-copy-btn:disabled::after {
          display: none;
        }

        .card-disclaimer-note {
          font-size: 9.5px;
          color: var(--muted);
          line-height: 1.5;
          text-align: center;
          margin: 7px 0 0;
        }

        /* =========================================
           QUICK ACTIONS CARD (8 SCULPTED 3D CREAM-GOLD BUTTONS: 4 + 4)
           ========================================= */

        .quick-actions-card {
          width: 100%;
          border-radius: 23px;
          padding: 18px 10px;
          box-sizing: border-box;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .soft-action-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          width: 100%;
        }

        .action-row-upper,
        .action-row-lower {
          display: flex;
          flex-wrap: nowrap;
          justify-content: center;
          align-items: flex-start;
          gap: 6px;
          width: 100%;
        }

        .action-row-lower:empty {
          display: none;
        }

        .soft-circle-action {
          flex: 1 1 0;
          max-width: 88px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 7px;

          text-decoration: none !important;
          color: #4a1c1a;

          background: transparent;
          border: none;
          font-family: inherit;

          cursor: pointer;
          padding: 2px 2px 4px;

          -webkit-tap-highlight-color: transparent;

          transition: transform 0.18s ease, color 0.18s ease;
        }

        .soft-circle-action:hover {
          transform: translateY(-3px);
        }

        .soft-circle-action:active {
          transform: translateY(2px) scale(0.96);
        }

        .soft-circle-action:focus-visible {
          outline: 3px solid #e6b85c;
          outline-offset: 3px;
          border-radius: 14px;
        }

        .icon-disc {
          position: relative;
          overflow: hidden;

          width: 52px;
          height: 52px;
          border-radius: 50%;

          background: linear-gradient(
            145deg,
            #ffffff 0%,
            #fdf4e6 50%,
            #f2d8ae 100%
          );
          color: #8c2328;

          display: grid;
          place-items: center;

          border: 1px solid #e2be82;

          box-shadow:
            0 8px 16px rgba(74, 10, 16, 0.15),
            0 2.5px 5px rgba(74, 10, 16, 0.08),
            inset 0 2px 3px rgba(255, 255, 255, 0.98),
            inset 0 -3px 4px rgba(184, 132, 36, 0.22);

          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }

        .icon-disc::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 8px;
          right: 8px;
          height: 38%;
          border-radius: 50%;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.94),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .icon-disc::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          border: 1px solid rgba(255, 250, 236, 0.72);
          pointer-events: none;
        }

        .icon-disc svg {
          position: relative;
          z-index: 1;
          width: 22px;
          height: 22px;
          stroke: currentColor;
          stroke-width: 1.85;
          filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.85));
          transition: transform 0.18s ease, filter 0.18s ease;
        }

        .soft-circle-action:hover .icon-disc {
          transform: translateY(-2px);
          background: linear-gradient(
            145deg,
            #ebbd5b 0%,
            #c88b22 55%,
            #9d6710 100%
          );
          border-color: #94600e;
          color: #ffffff;
          box-shadow:
            0 11px 22px rgba(158, 102, 16, 0.3),
            0 4px 7px rgba(74, 10, 16, 0.16),
            inset 0 2px 3px rgba(255, 248, 224, 0.55),
            inset 0 -3px 4px rgba(96, 56, 6, 0.35);
        }

        .soft-circle-action:hover .icon-disc::before {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.42),
            rgba(255, 255, 255, 0)
          );
        }

        .soft-circle-action:hover .icon-disc svg {
          transform: scale(1.06);
          filter: drop-shadow(0 1px 2px rgba(84, 48, 4, 0.3));
        }

        .soft-circle-action:active .icon-disc {
          transform: translateY(2.5px) scale(0.96);
          box-shadow:
            0 2px 4px rgba(74, 10, 16, 0.18),
            inset 0 3px 6px rgba(154, 110, 28, 0.24);
        }

        .icon-tag {
          font-size: 9.5px;
          font-weight: 500;
          color: #4a1c1a;
          line-height: 1.3;
          white-space: nowrap;
        }

        /* =========================================
           GALLERY
           ========================================= */

        .cafe-gallery-section {
          width: 100%;
          box-sizing: border-box;
          padding: 18px 14px 14px;
          margin: 0 0 16px;
          border-radius: 23px;
          overflow: hidden;
        }

        .gallery-heading {
          text-align: center;
          margin: 0 0 13px;
        }

        .gallery-eyebrow {
          display: inline-block;
          color: var(--gold);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .gallery-title {
          font-family: "Outfit", sans-serif;
          color: var(--brand-dark);
          font-size: 21px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 5px;
        }

        .gallery-subtitle {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
        }

        .gallery-slider {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          background: #f7ebdc;

          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
        }

        .gallery-track {
          display: flex;
          width: 100%;

          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);

          will-change: transform;
        }

        .gallery-slide {
          flex: 0 0 100%;
          width: 100%;
          min-width: 100%;
          box-sizing: border-box;
        }

        .gallery-image-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          min-height: 210px;
          max-height: 290px;

          overflow: hidden;
          border-radius: 16px;

          background: linear-gradient(145deg, #f9edd8, #fffdf8);

          border: 1px solid #ead4b7;
        }

        .gallery-real-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 7px;
          box-sizing: border-box;
          user-select: none;
          -webkit-user-drag: none;
        }

        .gallery-placeholder-frame {
          display: grid;
          place-items: center;
        }

        .gallery-placeholder-inner {
          width: calc(100% - 28px);
          height: calc(100% - 28px);
          box-sizing: border-box;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;

          border: 2px dashed #e2be82;
          border-radius: 13px;
          padding: 12px;
          text-align: center;
        }

        .gallery-placeholder-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;

          color: var(--brand);
          background: #ffffff;
          border: 1px solid #ebd4b0;

          box-shadow: 0 6px 11px rgba(74, 10, 16, 0.1);

          animation: placeholderPulse 2.4s ease-in-out infinite;
        }

        @keyframes placeholderPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        .gallery-placeholder-title {
          font-family: "Outfit", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--brand-dark);
          margin: 0;
        }

        .gallery-placeholder-hint {
          font-size: 10px;
          color: #8c6b63;
          margin: 0;
          line-height: 1.45;
        }

        .gallery-arrow {
          position: absolute;
          z-index: 2;
          top: 50%;
          transform: translateY(-50%);

          width: 34px;
          height: 34px;
          border-radius: 50%;

          display: grid;
          place-items: center;

          background: linear-gradient(180deg, #ffffff 0%, #faefde 100%);
          color: var(--brand-dark);
          border: 1px solid rgba(255, 255, 255, 0.94);

          box-shadow:
            0 5px 12px rgba(74, 10, 16, 0.16),
            inset 0 1.5px 2px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(154, 110, 28, 0.1);

          cursor: pointer;

          transition:
            background 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;

          -webkit-tap-highlight-color: transparent;
        }

        .gallery-arrow-left {
          left: 9px;
        }

        .gallery-arrow-right {
          right: 9px;
        }

        .gallery-arrow:hover {
          background: #ffffff;
          box-shadow:
            0 7px 15px rgba(74, 10, 16, 0.22),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
        }

        .gallery-arrow:active {
          transform: translateY(-50%) scale(0.91);
        }

        .gallery-bottom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 13px;
          min-height: 12px;
        }

        .gallery-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 5px;
        }

        .gallery-dot {
          appearance: none;
          -webkit-appearance: none;

          width: 7px;
          height: 7px;
          min-width: 7px;

          padding: 0;
          border: 0;
          border-radius: 20px;

          background: #e3ccb0;
          cursor: pointer;

          transition:
            width 350ms ease,
            background 250ms ease;
        }

        .gallery-dot.active {
          width: 22px;
          background: var(--brand);
        }

        .gallery-counter {
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .gallery-counter-divider {
          color: #d6ba96;
          padding: 0 2px;
        }

        /* =========================================
           MAP CARD
           ========================================= */

        .embedded-map-card {
          width: 100%;
          border-radius: 23px;
          padding: 16px;
          box-sizing: border-box;
          margin-bottom: 14px;
          text-align: left;
          overflow: hidden;
        }

        .map-card-header-link {
          text-decoration: none;
        }

        .map-card-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          font-family: "Outfit", sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-dark);

          margin-bottom: 10px;
        }

        .map-iframe-container {
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #ead4b7;
          margin-bottom: 10px;
        }

        .map-directions-link {
          position: relative;
          overflow: hidden;
          font-size: 11px;
          font-weight: 700;
          color: #8c2328;
          background: linear-gradient(180deg, #ffffff 0%, #faefde 100%);
          border: 1px solid #e3c28d;
          border-radius: 12px;
          padding: 11px;
          text-decoration: none;
          display: block;
          text-align: center;
          box-shadow:
            0 5px 10px rgba(74, 10, 16, 0.12),
            0 1.5px 3px rgba(74, 10, 16, 0.06),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98),
            inset 0 -1.5px 2px rgba(184, 132, 36, 0.12);
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease;
        }

        .map-directions-link:hover {
          transform: translateY(-1.5px);
          box-shadow:
            0 7px 14px rgba(74, 10, 16, 0.16),
            inset 0 1.5px 1.5px rgba(255, 255, 255, 0.98);
        }

        .map-directions-link:active {
          transform: translateY(1.5px);
          box-shadow:
            0 2px 4px rgba(74, 10, 16, 0.14),
            inset 0 2px 4px rgba(184, 132, 36, 0.16);
        }

        .address-highlight-box {
          background: #fbf1e3;
          border-radius: 13px;
          padding: 12px;
          margin-bottom: 10px;
        }

        .agency-clean-address {
          font-size: 11px;
          color: var(--ink);
          margin: 0;
          line-height: 1.6;
          text-align: center;
        }

        /* =========================================
           MINI FOOTER
           ========================================= */

        .mini-footer {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 2px;
        }

        .mini-footer-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px;

          padding: 6px 12px;

          border: 1px solid rgba(255, 224, 150, 0.45);
          border-radius: 999px;
          background: rgba(255, 251, 245, 0.94);

          font-size: 9px;
          color: var(--muted);
          line-height: 1.4;
        }

        .mini-footer-pill strong {
          color: var(--brand-dark);
          font-weight: 800;
        }

        .mini-footer-dot {
          color: var(--gold);
        }

        .mini-footer-pill a {
          color: var(--brand);
          font-weight: 800;
          text-decoration: none;
        }

        /* =========================================
           RESPONSIVE + ACCESSIBILITY
           ========================================= */

        @media (max-width: 360px) {
          .soft-luxury-viewport {
            padding: 10px 11px 24px;
          }

          .cafe-gallery-section {
            padding: 14px 10px 12px;
          }

          .gallery-title {
            font-size: 19px;
          }

          .gallery-image-frame {
            min-height: 190px;
          }

          .gallery-arrow {
            width: 30px;
            height: 30px;
          }

          .icon-disc {
            width: 44px;
            height: 44px;
          }

          .icon-tag {
            font-size: 9px;
          }

          .action-row-upper,
          .action-row-lower {
            gap: 4px;
          }
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 3px solid #e6b85c;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  );
}
