"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasProfile, loadProfile } from "@/lib/storage";
import { trackAppOpened } from "@/lib/analytics";

export default function LandingPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const profileExists = hasProfile();
    setHasSaved(profileExists);
    const profile = loadProfile();
    if (profile?.fullName) setSavedName(profile.fullName);
    trackAppOpened(profileExists);
  }, []);

  const handleNew = () => {
    router.push("/form?mode=new");
  };

  const handleSaved = () => {
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
              { icon: "📱", text: "Works on your phone — Chrome extensions don't" },
              { icon: "✅", text: "QR code generates every time — no broken links" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <span className="text-base leading-tight mt-0.5">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
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
