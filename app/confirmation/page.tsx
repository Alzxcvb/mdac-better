"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRConfirmation from "@/components/QRConfirmation";
import { type FormData } from "@/lib/types";
import { resetTripFields } from "@/lib/storage";

// ---- Official Submit Section (Multi-step) ----

type SubmitPhase = "idle" | "connecting" | "submitting" | "success" | "error";

interface SubmitResult {
  success: boolean;
  message?: string;
  error?: string;
  fallbackUrl?: string;
  partial?: boolean;
  captchaRequired?: boolean;
}

const PHASE_MESSAGES: Record<string, string> = {
  connecting: "Connecting to Malaysia immigration...",
  submitting: "Submitting your arrival card...",
};

function OfficialSubmitSection({ data }: { data: FormData }) {
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const handleSubmit = async () => {
    setPhase("connecting");
    setResult(null);

    try {
      // Step 1: Initialize session with official MDAC server
      const initRes = await fetch("/api/submit-mdac/init", { method: "POST" });
      const initJson = await initRes.json();

      if (!initRes.ok || !initJson.success) {
        throw new Error(initJson.error || "Could not connect to MDAC server");
      }

      // Step 2: Submit the form
      setPhase("submitting");

      const submitRes = await fetch("/api/submit-mdac/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: initJson.session,
          formData: data,
        }),
      });

      const submitJson: SubmitResult = await submitRes.json();
      setResult(submitJson);
      setPhase(submitJson.success ? "success" : "error");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setResult({
        success: false,
        error: message,
        fallbackUrl: "https://imigresen-online.imi.gov.my/mdac/main?registerMain",
      });
      setPhase("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div>
        <h3 className="text-base font-bold text-gray-900">Submit to Official MDAC</h3>
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ll submit your data directly to Malaysia&apos;s immigration system.
          You&apos;ll receive a PIN by email to get your official QR code.
        </p>
      </div>

      {phase === "idle" && (
        <button
          onClick={handleSubmit}
          className="w-full bg-[#003893] hover:bg-blue-900 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
        >
          Submit to Official MDAC
        </button>
      )}

      {(phase === "connecting" || phase === "submitting") && (
        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#003893] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm font-medium text-gray-600">{PHASE_MESSAGES[phase]}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#003893] rounded-full transition-all duration-1000"
              style={{ width: phase === "connecting" ? "40%" : "80%" }}
            />
          </div>
        </div>
      )}

      {phase === "success" && result && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Submitted successfully!</p>
            <p className="text-sm text-green-700 mt-1">
              Check <strong>{data.email}</strong> for your PIN code.
              Use it on the official MDAC site to retrieve your border-valid QR code.
            </p>
          </div>
        </div>
      )}

      {phase === "error" && result && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              {result.captchaRequired ? "CAPTCHA required" : "Submission issue"}
            </p>
            <p className="text-sm text-amber-700">{result.error}</p>
            {result.partial && (
              <p className="text-sm text-amber-600 mt-2">
                Check your email just in case — the submission may have gone through.
              </p>
            )}
          </div>

          {result.fallbackUrl && (
            <a
              href={result.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white border-2 border-[#003893] text-[#003893] font-semibold text-sm py-3 rounded-2xl transition-all active:scale-95"
            >
              <span>Submit manually on official site</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#003893] hover:bg-blue-900 text-white font-semibold text-sm py-3 rounded-2xl transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ---- QR View ----

function QRView({ data, onNewTrip }: { data: FormData; onNewTrip: () => void }) {
  return (
    <div className="space-y-4">
      <QRConfirmation data={data} onNewTrip={onNewTrip} />
      <OfficialSubmitSection data={data} />
    </div>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState(false);

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
      <QRView data={formData} onNewTrip={handleNewTrip} />
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
