"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRConfirmation from "@/components/QRConfirmation";
import { FormData } from "@/lib/types";
import { resetTripFields } from "@/lib/storage";

interface OfficialQRData {
  type: "image" | "pdf";
  data: string; // base64
}

// ---- Official QR View ----
// Shown when the passthrough backend successfully returned an official QR/PDF.

function OfficialQRView({
  data,
  officialQR,
  onNewTrip,
}: {
  data: FormData;
  officialQR: OfficialQRData;
  onNewTrip: () => void;
}) {
  return (
    <div className="step-enter space-y-5">
      {/* Success header */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Arrival Card</h2>
        <p className="text-gray-500 mt-1 text-sm">Ready to present at immigration</p>
      </div>

      {/* Official badge */}
      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
        <span className="text-sm font-semibold text-green-800">Official Malaysia Immigration QR Code</span>
      </div>
      <p className="text-xs text-center text-gray-500">Valid at all Malaysian border crossings</p>

      {/* Traveler info banner */}
      <div className="bg-[#003893] text-white rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold">{data.fullName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">{data.fullName}</p>
          <p className="text-blue-200 text-sm">Passport: {data.passportNumber}</p>
        </div>
      </div>

      {/* Official QR image or PDF notice */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
        {officialQR.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${officialQR.data}`}
            alt="Official Malaysia Immigration QR Code"
            className="w-56 h-56 object-contain"
          />
        ) : (
          <div className="text-center space-y-3">
            <svg className="w-16 h-16 text-[#CC0001] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">Confirmation PDF received</p>
            <a
              href={`data:application/pdf;base64,${officialQR.data}`}
              download={`mdac-${data.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`}
              className="inline-flex items-center gap-2 bg-[#003893] text-white font-semibold text-sm py-3 px-5 rounded-xl hover:bg-blue-900 transition-colors"
            >
              Download PDF
            </a>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Screenshot this screen or save the QR code
        </p>
      </div>

      <button
        onClick={onNewTrip}
        className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95 hover:border-gray-300"
      >
        Fill for Another Trip
      </button>
    </div>
  );
}

// ---- Demo QR View ----
// Shown when no official QR is available (demo/proof-of-concept mode).

function DemoQRView({ data, onNewTrip }: { data: FormData; onNewTrip: () => void }) {
  return (
    <div className="space-y-4">
      {/* Demo badge */}
      <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-800">Demo QR — proof of concept only</span>
      </div>
      <p className="text-xs text-center text-gray-500">Not valid at border — for demonstration purposes only</p>

      <QRConfirmation data={data} onNewTrip={onNewTrip} />
    </div>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState(false);
  const [officialQR, setOfficialQR] = useState<OfficialQRData | null>(null);

  useEffect(() => {
    const raw = searchParams.get("data");
    if (!raw) {
      setError(true);
      return;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as FormData;
      setFormData(parsed);
    } catch {
      setError(true);
      return;
    }

    // Check sessionStorage for official QR from the passthrough backend
    try {
      const storedQR = sessionStorage.getItem("mdac_official_qr");
      if (storedQR) {
        const parsed = JSON.parse(storedQR) as OfficialQRData;
        setOfficialQR(parsed);
        // Clear immediately after reading so it doesn't persist across page visits
        sessionStorage.removeItem("mdac_official_qr");
      }
    } catch {
      // sessionStorage may be unavailable in some environments — silently ignore
    }
  }, [searchParams]);

  const handleNewTrip = () => {
    if (!formData) {
      router.push("/form?mode=new");
      return;
    }
    const reset = resetTripFields(formData);
    const encoded = encodeURIComponent(JSON.stringify(reset));
    router.push(`/form?mode=trip&draft=${encoded}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
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
    <div className="px-6 py-6 max-w-lg mx-auto">
      {officialQR ? (
        <OfficialQRView data={formData} officialQR={officialQR} onNewTrip={handleNewTrip} />
      ) : (
        <DemoQRView data={formData} onNewTrip={handleNewTrip} />
      )}
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
          Ready
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
