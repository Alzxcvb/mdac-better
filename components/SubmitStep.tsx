"use client";

import { useState } from "react";
import { FormData } from "@/lib/types";

interface Props {
  data: FormData;
  onBack: () => void;
  onComplete: () => void;
}

type SubmitState = "idle" | "submitting" | "awaiting_pin" | "retrieving" | "error";

const PASSTHROUGH_URL = process.env.NEXT_PUBLIC_PASSTHROUGH_URL;

export default function SubmitStep({ data, onBack, onComplete }: Props) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [useOfficial, setUseOfficial] = useState(true);
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // If no passthrough URL is configured, skip straight to demo QR
  const canUseOfficial = !!PASSTHROUGH_URL;

  const handleDemoQR = () => {
    // Clear any official QR from previous sessions
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("mdac_official_qr");
    }
    onComplete();
  };

  const handleSubmitOfficial = async () => {
    if (!PASSTHROUGH_URL) {
      handleDemoQR();
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const payload = {
        fullName: data.fullName,
        passportNumber: data.passportNumber,
        nationality: data.nationality,
        dateOfBirth: data.dateOfBirth,
        sex: data.sex,
        passportIssueDate: data.passportIssueDate,
        passportExpiry: data.passportExpiry,
        email: data.email,
        phoneCountryCode: data.phoneCountryCode,
        phoneNumber: data.phoneNumber,
        homeAddress: data.homeAddress,
        arrivalDate: data.arrivalDate,
        flightNumber: data.flightNumber,
        portOfEntry: data.portOfEntry,
        departureCity: data.departureCity,
        durationOfStay: Number(data.durationOfStay) || 1,
        hotelName: data.hotelName,
        addressInMalaysia: data.addressInMalaysia,
        cityInMalaysia: data.cityInMalaysia,
        postalCode: data.postalCode,
        accommodationPhone: data.accommodationPhone,
      };

      const res = await fetch(`${PASSTHROUGH_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(125_000),
      });

      const result = await res.json();

      if (result.success) {
        setSubmitState("awaiting_pin");
      } else {
        setErrorMessage(result.error || "Submission failed. Please try again.");
        setSubmitState("error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setErrorMessage(`Could not reach the submission server: ${message}`);
      setSubmitState("error");
    }
  };

  const handleRetrieveQR = async () => {
    if (!PASSTHROUGH_URL || !pin.trim()) return;

    setSubmitState("retrieving");
    setErrorMessage("");

    try {
      const res = await fetch(`${PASSTHROUGH_URL}/api/retrieve-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneCountryCode: data.phoneCountryCode,
          phoneNumber: data.phoneNumber,
          pin: pin.trim(),
        }),
        signal: AbortSignal.timeout(125_000),
      });

      const result = await res.json();

      if (result.success) {
        // Store the official QR in sessionStorage for the confirmation page
        if (typeof window !== "undefined") {
          const qrData = result.qrImageBase64 || result.pdfBase64 || null;
          if (qrData) {
            sessionStorage.setItem(
              "mdac_official_qr",
              JSON.stringify({
                type: result.qrImageBase64 ? "image" : "pdf",
                data: qrData,
              })
            );
          }
        }
        onComplete();
      } else {
        setErrorMessage(result.error || "Could not retrieve QR code. Check your PIN and try again.");
        setSubmitState("error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setErrorMessage(`Could not reach the server: ${message}`);
      setSubmitState("error");
    }
  };

  // ---- IDLE STATE ----
  if (submitState === "idle") {
    return (
      <div className="step-enter space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Submit to Official MDAC</h2>
          <p className="text-sm text-gray-500 mt-1">
            Final step — generate your arrival card
          </p>
        </div>

        {canUseOfficial ? (
          <>
            {/* Official submission explanation */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
              <p className="text-sm text-gray-700">
                We can submit your information directly to the{" "}
                <strong>official Malaysian Immigration system</strong> on your behalf. You will
                receive a PIN code at <strong>{data.email}</strong> within a few minutes — use it
                below to retrieve your official QR code.
              </p>
            </div>

            {/* Toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={useOfficial}
                    onChange={(e) => setUseOfficial(e.target.checked)}
                  />
                  <div
                    onClick={() => setUseOfficial((v) => !v)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      useOfficial ? "bg-[#003893]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        useOfficial ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Submit via official system</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {useOfficial
                      ? "Will submit to Malaysia Immigration and retrieve your official QR"
                      : "Skip — generate a demo QR only (not valid at border)"}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onBack}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
              >
                Back
              </button>
              {useOfficial ? (
                <button
                  onClick={handleSubmitOfficial}
                  className="flex-1 bg-[#CC0001] hover:bg-red-700 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
                >
                  Submit to Malaysia Immigration →
                </button>
              ) : (
                <button
                  onClick={handleDemoQR}
                  className="flex-1 bg-[#003893] hover:bg-blue-900 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
                >
                  Generate Demo QR
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* No passthrough configured — demo only */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Demo mode:</strong> Official submission is not configured. Your card will
                be generated as a proof-of-concept QR code only.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onBack}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
              >
                Back
              </button>
              <button
                onClick={handleDemoQR}
                className="flex-1 bg-[#003893] hover:bg-blue-900 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
              >
                Generate Demo QR
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ---- SUBMITTING STATE ----
  if (submitState === "submitting") {
    return (
      <div className="step-enter flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-3 border-[#003893] border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-semibold text-gray-700">Submitting to official MDAC system...</p>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          This may take up to a minute. Please keep this page open.
        </p>
      </div>
    );
  }

  // ---- AWAITING PIN STATE ----
  if (submitState === "awaiting_pin") {
    return (
      <div className="step-enter space-y-5">
        {/* Success banner */}
        <div className="flex flex-col items-center text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Submitted successfully!</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Check <strong>{data.email}</strong> for your PIN code. It usually arrives within a few
            minutes.
          </p>
        </div>

        {/* PIN input */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Enter PIN Code from Email
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 123456"
            className="w-full px-4 py-4 rounded-xl border border-gray-200 text-2xl font-bold tracking-widest text-center bg-white outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] transition-colors"
          />
        </div>

        <button
          onClick={handleRetrieveQR}
          disabled={pin.length < 4}
          className="w-full bg-[#CC0001] hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
        >
          Retrieve Official QR Code
        </button>

        <button
          onClick={handleDemoQR}
          className="w-full text-sm text-gray-400 hover:text-gray-600 underline text-center py-2 transition-colors"
        >
          Use demo QR instead
        </button>
      </div>
    );
  }

  // ---- RETRIEVING STATE ----
  if (submitState === "retrieving") {
    return (
      <div className="step-enter flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-3 border-[#CC0001] border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-semibold text-gray-700">Retrieving your official QR code...</p>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          Connecting to Malaysia Immigration...
        </p>
      </div>
    );
  }

  // ---- ERROR STATE ----
  if (submitState === "error") {
    return (
      <div className="step-enter space-y-5">
        <div className="flex flex-col items-center text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-3">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">{errorMessage}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSubmitState("idle")}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={handleDemoQR}
            className="flex-1 bg-[#003893] hover:bg-blue-900 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
          >
            Use Demo QR
          </button>
        </div>
      </div>
    );
  }

  return null;
}
