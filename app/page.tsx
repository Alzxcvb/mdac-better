"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasProfile, loadProfile } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasSaved(hasProfile());
    const profile = loadProfile();
    if (profile?.fullName) setSavedName(profile.fullName);
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
          {/* Malaysian flag stripes mini icon */}
          <div className="w-8 h-6 rounded overflow-hidden border border-white/20 flex-shrink-0">
            <div className="h-full flex flex-col">
              {[...Array(14)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ background: i % 2 === 0 ? "#CC0001" : "#FFFFFF" }}
                />
              ))}
            </div>
          </div>
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
            <span>HACKATHON DEMO</span>
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
              { icon: "📅", text: "Date picker that works (no 60-year scrolling)" },
              { icon: "💾", text: "Profile saved — one tap on your next trip" },
              { icon: "📱", text: "Actually designed for mobile" },
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
