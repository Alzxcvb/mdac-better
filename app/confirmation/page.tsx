"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRConfirmation from "@/components/QRConfirmation";
import { type FormData } from "@/lib/types";
import { resetTripFields } from "@/lib/storage";

// ---- Official Submit Section (Multi-step) ----

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main?registerMain";

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

function buildDataSummary(data: FormData): string {
  return (
    `Full Name: ${data.fullName}\n` +
    `Passport Number: ${data.passportNumber}\n` +
    `Passport Type: ${data.passportType}\n` +
    `Nationality: ${data.nationality}\n` +
    `Date of Birth: ${data.dateOfBirth}\n` +
    `Sex: ${data.sex}\n` +
    `Country of Passport Issuance: ${data.countryOfPassportIssuance}\n` +
    `Place of Birth: ${data.placeOfBirth}\n` +
    `Passport Expiry: ${data.passportExpiry}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phoneCountryCode}${data.phoneNumber}\n` +
    `Arrival Date: ${data.arrivalDate}\n` +
    `Departure Date: ${data.departureDate}\n` +
    `Mode of Transport: ${data.modeOfTransport}\n` +
    `Flight/Transport Number: ${data.flightNumber}\n` +
    `Country of Last Departure: ${data.departureCountry}\n` +
    `Hotel/Address Name: ${data.hotelName}\n` +
    `Street Address: ${data.addressInMalaysia}\n` +
    `City: ${data.cityInMalaysia}\n` +
    `State: ${data.stateInMalaysia}\n` +
    `Postal Code: ${data.postalCode}`
  );
}

function DataSummaryCard({ data, summary }: { data: FormData; summary: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Your form data</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#003893] border border-[#003893] rounded-lg px-3 py-1.5 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy all
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500">Screenshot or copy this and send to your admin to submit manually.</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {[
          ["Full Name", data.fullName],
          ["Passport No.", data.passportNumber],
          ["Passport Type", data.passportType],
          ["Nationality", data.nationality],
          ["Date of Birth", data.dateOfBirth],
          ["Sex", data.sex],
          ["Issuing Country", data.countryOfPassportIssuance],
          ["Place of Birth", data.placeOfBirth],
          ["Passport Expiry", data.passportExpiry],
          ["Email", data.email],
          ["Phone", `${data.phoneCountryCode}${data.phoneNumber}`],
          ["Arrival Date", data.arrivalDate],
          ["Departure Date", data.departureDate],
          ["Transport", data.modeOfTransport],
          ["Flight/Ref No.", data.flightNumber],
          ["Last Departure", data.departureCountry],
          ["Hotel/Address", data.hotelName],
          ["Street", data.addressInMalaysia],
          ["City", data.cityInMalaysia],
          ["State", data.stateInMalaysia],
          ["Postal Code", data.postalCode],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-medium text-gray-900 break-words">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfficialSubmitSection({ data }: { data: FormData }) {
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const handleSubmit = async () => {
    setPhase("connecting");
    setResult(null);

    try {
      const initRes = await fetch("/api/submit-mdac/init", { method: "POST" });
      const initJson = await initRes.json();

      if (!initRes.ok || !initJson.success) {
        throw new Error(initJson.error || "Could not connect to MDAC server");
      }

      setPhase("submitting");

      const submitRes = await fetch("/api/submit-mdac/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: initJson.session, formData: data }),
      });

      const submitJson: SubmitResult = await submitRes.json();
      setResult(submitJson);
      setPhase(submitJson.success ? "success" : "error");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setResult({
        success: false,
        error: message,
        fallbackUrl: MDAC_URL,
      });
      setPhase("error");
    }
  };

  // ---- Success ----
  if (phase === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-green-900">Successfully submitted!</p>
            <p className="text-sm text-green-700">We submitted your arrival card to Malaysia Immigration.</p>
          </div>
        </div>
        <div className="bg-white border border-green-200 rounded-xl p-3">
          <p className="text-sm text-green-800">
            Check <strong>{data.email}</strong> for your PIN code from Malaysia Immigration.
            Use it on the official site to retrieve your border-valid QR code.
          </p>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (phase === "error" && result) {
    const dataSummary = buildDataSummary(data);
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-red-900">Submission failed</p>
              <p className="text-sm text-red-700">We could not submit your form automatically.</p>
            </div>
          </div>

          <p className="text-sm text-red-800">
            Please submit directly on the official Malaysia Immigration website:
          </p>

          <a
            href={MDAC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#003893] text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
          >
            <span>Submit on Official MDAC Site</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={handleSubmit}
            className="w-full text-gray-500 text-sm py-2 underline"
          >
            Try again
          </button>
        </div>

        {/* Data summary — always visible on failure so user can share with admin */}
        <DataSummaryCard data={data} summary={dataSummary} />
      </div>
    );
  }

  // ---- Idle / Loading ----
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
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#003893] rounded-full transition-all duration-1000"
              style={{ width: phase === "connecting" ? "40%" : "80%" }}
            />
          </div>
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
