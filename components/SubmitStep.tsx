"use client";

import { useState, useEffect, useCallback } from "react";
import { type FormData } from "@/lib/types";
import CaptchaSolver from "./CaptchaSolver";

interface Props {
  data: FormData;
  onSuccess: () => void;
  onBack: () => void;
}

type Phase = "submitting" | "captcha" | "solving" | "success" | "error";

interface CaptchaData {
  sessionId: string;
  imageBase64: string;
  width: number;
  height: number;
}

export default function SubmitStep({ data, onSuccess, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("submitting");
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [error, setError] = useState<string>("");
  const [canRetry, setCanRetry] = useState(false);

  // Start the session when this component mounts
  const startSession = useCallback(async () => {
    setPhase("submitting");
    setError("");
    setCaptcha(null);

    try {
      const res = await fetch("/api/submit-mdac/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.sessionId) {
        setPhase("error");
        setError(result.error || "Failed to start submission. Please try again.");
        setCanRetry(true);
        return;
      }

      setCaptcha({
        sessionId: result.sessionId,
        imageBase64: result.captchaImageBase64,
        width: result.captchaWidth,
        height: result.captchaHeight,
      });
      setPhase("captcha");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Network error. Check your connection.");
      setCanRetry(true);
    }
  }, [data]);

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  const handleCaptchaSolve = async (sliderX: number) => {
    if (!captcha) return;
    setPhase("solving");

    try {
      const res = await fetch("/api/submit-mdac/solve-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: captcha.sessionId,
          sliderX,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setPhase("success");
        // Brief pause to show success animation, then navigate
        setTimeout(() => onSuccess(), 1500);
        return;
      }

      // Retryable — new CAPTCHA provided
      if (result.retryable && result.newCaptchaImageBase64) {
        setCaptcha({
          ...captcha,
          imageBase64: result.newCaptchaImageBase64,
          width: result.newCaptchaWidth || captcha.width,
          height: result.newCaptchaHeight || captcha.height,
        });
        setPhase("captcha");
        setError("Verification failed. Try again.");
        return;
      }

      // Retryable but no new CAPTCHA — start fresh
      if (result.retryable) {
        setError(result.error || "Verification failed. Starting over...");
        setCanRetry(true);
        setPhase("error");
        return;
      }

      // Non-retryable
      setPhase("error");
      setError(result.error || "Submission failed.");
      setCanRetry(true);
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Network error.");
      setCanRetry(true);
    }
  };

  return (
    <div className="step-enter space-y-6">
      {/* Submitting phase */}
      {phase === "submitting" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 border-3 border-[#003893] border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-bold text-gray-900">Submitting Your Form</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            We&apos;re filling out the official MDAC form for you. This may take a moment...
          </p>
        </div>
      )}

      {/* CAPTCHA phase */}
      {phase === "captcha" && captcha && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">One More Step</h2>
            <p className="text-sm text-gray-500 mt-1">
              Solve this verification to complete your submission
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          <CaptchaSolver
            imageBase64={captcha.imageBase64}
            width={captcha.width}
            height={captcha.height}
            onSolve={handleCaptchaSolve}
          />
        </div>
      )}

      {/* Solving phase */}
      {phase === "solving" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 border-3 border-[#003893] border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-bold text-gray-900">Verifying</h2>
          <p className="text-sm text-gray-500 mt-2">
            Completing your submission...
          </p>
        </div>
      )}

      {/* Success phase */}
      {phase === "success" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Submitted!</h2>
          <p className="text-sm text-gray-500 mt-2">
            Check your email for your PIN code.
          </p>
        </div>
      )}

      {/* Error phase */}
      {phase === "error" && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Something Went Wrong</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">{error}</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={onBack}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
            >
              Go Back
            </button>
            {canRetry && (
              <button
                onClick={startSession}
                className="flex-1 bg-[#003893] text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back button — only visible during CAPTCHA phase */}
      {phase === "captcha" && (
        <button
          onClick={onBack}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
        >
          Back to Review
        </button>
      )}
    </div>
  );
}
