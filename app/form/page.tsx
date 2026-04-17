"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PersonalStep from "@/components/PersonalStep";
import TravelStep from "@/components/TravelStep";
import ReviewStep from "@/components/ReviewStep";
import SubmitStep from "@/components/SubmitStep";
import StepIndicator from "@/components/StepIndicator";
import { FormData, EMPTY_FORM } from "@/lib/types";
import {
  saveProfile,
  saveDraft,
  clearDraft,
  buildNewFormFromProfile,
  loadDraft,
} from "@/lib/storage";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (mode === "saved") {
      // Load profile fields pre-filled
      const prefilled = buildNewFormFromProfile();
      setFormData(prefilled);
    } else if (mode === "trip") {
      const draftJson = sessionStorage.getItem("mdac_trip_draft");
      if (draftJson) {
        try {
          const parsed = JSON.parse(draftJson) as FormData;
          setFormData(parsed);
          saveDraft(parsed);
          sessionStorage.removeItem("mdac_trip_draft");
        } catch {
          setFormData({ ...EMPTY_FORM });
        }
      } else {
        setFormData({ ...EMPTY_FORM });
      }
    } else {
      // Check for a draft or start fresh
      const draft = loadDraft();
      if (draft) {
        setFormData(draft);
      } else {
        setFormData({ ...EMPTY_FORM });
      }
    }
  }, [mode, initialized, searchParams]);

  const handleChange = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      saveDraft(next);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1) {
      trackEvent(ANALYTICS_EVENTS.step1Complete, {
        mode: mode ?? "draft",
      });
    } else if (step === 2) {
      trackEvent(ANALYTICS_EVENTS.step2Complete, {
        mode: mode ?? "draft",
        transport: formData.modeOfTransport || "unknown",
      });
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formData.modeOfTransport, mode, step]);

  const handleBack = useCallback(() => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Called when ReviewStep submits — save profile, clear draft, proceed to submit step
  const handleReviewSubmit = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.step3ReviewSubmit, {
      save_profile: formData.saveProfile,
      transport: formData.modeOfTransport || "unknown",
    });
    if (formData.saveProfile) {
      saveProfile(formData);
    }
    clearDraft();
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formData]);

  // Called when SubmitStep succeeds — navigate to confirmation
  const handleSubmitSuccess = useCallback(() => {
    sessionStorage.setItem("mdac_confirmation", JSON.stringify(formData));
    router.push("/confirmation?submitted=true");
  }, [formData, router]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#003893] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <StepIndicator
        currentStep={step}
        totalSteps={4}
        labels={["Personal", "Travel", "Review", "Submit"]}
      />

      <div className="px-6 py-6 max-w-lg mx-auto">
        {step === 1 && (
          <PersonalStep data={formData} onChange={handleChange} onNext={handleNext} />
        )}
        {step === 2 && (
          <TravelStep
            data={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <ReviewStep
            data={formData}
            onChange={handleChange}
            onSubmit={handleReviewSubmit}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <SubmitStep
            data={formData}
            onSuccess={handleSubmitSuccess}
            onBack={() => {
              setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </>
  );
}

export default function FormPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#003893] text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">Malaysia Arrival Card</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#003893] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <FormContent />
      </Suspense>
    </main>
  );
}
