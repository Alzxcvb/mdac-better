"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasProfile, loadProfile } from "@/lib/storage";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export default function LandingPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = hasProfile();
    setHasSaved(saved);
    const profile = loadProfile();
    if (profile?.fullName) setSavedName(profile.fullName);
    if (saved) {
      trackEvent(ANALYTICS_EVENTS.profileLoaded, {
        has_saved_profile: true,
      });
    }
  }, []);

  const handleNew = () => {
    trackEvent(ANALYTICS_EVENTS.formStarted, {
      mode: "new",
      has_saved_profile: hasSaved,
    });
    router.push("/form?mode=new");
  };

  const handleSaved = () => {
    trackEvent(ANALYTICS_EVENTS.formStarted, {
      mode: "saved",
      has_saved_profile: hasSaved,
    });
    router.push("/form?mode=saved");
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-[#003893] text-white px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Malaysian flag (Jalur Gemilang) */}
          <svg
            viewBox="0 0 20 10"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-5 rounded-sm overflow-hidden flex-shrink-0 border border-white/20"
            aria-label="Malaysian flag"
          >
            {/* 14 alternating red/white stripes */}
            {Array.from({ length: 14 }, (_, i) => (
              <rect
                key={i}
                x="0"
                y={i * (10 / 14)}
                width="20"
                height={10 / 14 + 0.05}
                fill={i % 2 === 0 ? "#CC0001" : "#FFFFFF"}
              />
            ))}
            {/* Blue canton — upper-left, half width, 8 stripes tall */}
            <rect x="0" y="0" width="10" height={80 / 14} fill="#003893" />
            {/* Yellow crescent moon */}
            <circle cx="3.7" cy="2.857" r="1.85" fill="#FFD100" />
            <circle cx="4.55" cy="2.857" r="1.42" fill="#003893" />
            {/* Yellow 14-pointed star */}
            <polygon
              fill="#FFD100"
              points="7.5,1.81 7.60,2.43 7.96,1.91 7.77,2.51 8.32,2.20 7.90,2.67 8.52,2.62 7.94,2.86 8.52,3.09 7.90,3.05 8.32,3.51 7.77,3.20 7.96,3.80 7.60,3.29 7.5,3.91 7.40,3.29 7.05,3.80 7.23,3.20 6.68,3.51 7.10,3.05 6.48,3.09 7.06,2.86 6.48,2.62 7.10,2.67 6.68,2.20 7.23,2.51 7.05,1.91 7.40,2.43"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide uppercase opacity-80">
            Malaysia
          </span>
        </div>
        <span className="text-white/40 text-sm">|</span>
        <span className="text-sm opacity-70">Arrival Card Demo</span>
      </div>

      {/* Hero section */}
      <div className="bg-[#003893] text-white px-6 pt-12 pb-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-48 h-48 rounded-full border-4 border-white" />
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-white" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FFD100] text-[#003893] text-xs font-bold px-3 py-1 rounded-full mb-4">
            <span>BETA</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-3">
            Malaysia Digital
            <br />
            Arrival Card
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Fill once. Done in{" "}
            <span className="text-[#FFD100] font-semibold">10 seconds</span>{" "}
            next time.
          </p>
        </div>
      </div>

      {/* Wave divider */}
      <div className="bg-[#003893]">
        <svg viewBox="0 0 375 30" className="w-full" preserveAspectRatio="none" height="30">
          <path d="M0 30 L0 15 Q93.75 0 187.5 15 Q281.25 30 375 15 L375 30 Z" fill="#f8f9fb" />
        </svg>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        {/* Desktop-only notice */}
        <div className="bg-red-600 border border-red-700 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-white">Desktop only — won&apos;t work on your phone</p>
            <p className="text-xs text-red-100 mt-0.5">
              Open this on your laptop or desktop computer. Native iOS &amp; Android apps are coming soon.
            </p>
          </div>
        </div>

        {/* Comparison callout */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            What this demo fixes
          </p>
          <div className="space-y-2.5">
            {[
              { icon: "📷", text: "Scan your passport — auto-fills the entire form" },
              { icon: "📅", text: "Date picker that works (no 60-year scrolling)" },
              { icon: "💾", text: "Profile saved — one tap on your next trip" },
              { icon: "📱", text: "Mobile app (iOS & Android) coming soon" },
              { icon: "✅", text: "QR code generates every time — no broken links" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <span className="text-base leading-tight mt-0.5">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chrome extension promo */}
        <div className="bg-[#003893] rounded-2xl p-4 mb-8 text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/10 rounded-xl p-2.5 flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
                <path d="M12 8 L20.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M4.5 8 L12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 20 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 4 L12 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold">Chrome Extension — Coming Soon</p>
                <span className="bg-[#FFD100] text-[#003893] text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">NEW</span>
              </div>
              <p className="text-blue-200 text-xs leading-relaxed">
                One-click autofill directly on the official MDAC site. No copy-pasting. Works in Chrome, Edge &amp; Brave.
              </p>
              <a
                href="https://github.com/Alzxcvb/mdac-better-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                Get Early Access on GitHub
              </a>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNew}
            className="w-full bg-[#CC0001] hover:bg-red-700 text-white font-semibold text-base py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-200"
          >
            Fill New Arrival Card
          </button>

          {mounted && hasSaved && (
            <button
              onClick={handleSaved}
              className="w-full bg-white hover:bg-gray-50 text-[#003893] font-semibold text-base py-4 px-6 rounded-2xl border-2 border-[#003893] transition-all active:scale-95 text-left flex items-center justify-between"
            >
              <div>
                <div>Use Saved Profile</div>
                {savedName && (
                  <div className="text-xs font-normal text-gray-500 mt-0.5">
                    {savedName} — saved on this device
                  </div>
                )}
              </div>
              <span className="text-[#003893] opacity-50 text-lg">→</span>
            </button>
          )}
        </div>

        {/* Comparison note */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Singapore has MyICA. Japan has Visit Japan Web.
            <br />
            <span className="text-[#003893] font-medium">
              Malaysia deserves better than a broken PDF form.
            </span>
          </p>
        </div>

        {/* Official disclaimer */}
        <p className="mt-4 text-xs text-gray-400 text-center">
          Proof-of-concept demo only. Not an official Malaysian government service.
        </p>
      </div>
    </main>
  );
}
