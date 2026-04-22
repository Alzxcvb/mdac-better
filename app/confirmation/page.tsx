"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRConfirmation from "@/components/QRConfirmation";
import { type FormData } from "@/lib/types";
import { resetTripFields } from "@/lib/storage";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState(false);
  const wasSubmitted = searchParams.get("submitted") === "true";
  const trackedQr = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("mdac_confirmation");
    if (!raw) {
      setError(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as FormData;
      setFormData(parsed);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (!formData || trackedQr.current) return;
    trackedQr.current = true;
    trackEvent(ANALYTICS_EVENTS.qrGenerated, {
      submitted: wasSubmitted,
      transport: formData.modeOfTransport || "unknown",
    });
  }, [formData, wasSubmitted]);

  const handleNewTrip = () => {
    if (!formData) {
      router.push("/form?mode=new");
      return;
    }
    const reset = resetTripFields(formData);
    sessionStorage.setItem("mdac_trip_draft", JSON.stringify(reset));
    router.push("/form?mode=trip");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-4xl mb-4">!</div>
        <p className="text-gray-600 mb-6">Something went wrong loading your card data.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#003893] text-white font-semibold py-3 px-6 rounded-xl"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#003893] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-lg mx-auto space-y-4">
      <QRConfirmation
        data={formData}
        onNewTrip={handleNewTrip}
        submitted={wasSubmitted}
      />
    </div>
  );
}

export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#003893] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Go home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">Your Arrival Card</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/20 text-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          Submitted
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#003893] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </main>
  );
}
