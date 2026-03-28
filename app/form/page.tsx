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
      // Returning from confirmation page — draft passed in URL
      const draftParam = searchParams.get("draft");
      if (draftParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(draftParam)) as FormData;
          setFormData(parsed);
          saveDraft(parsed);
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
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Called when ReviewStep "Continue" is clicked — move to step 4
  const handleReviewContinue = useCallback(() => {
    // Save profile if toggle is on
    if (formData.saveProfile) {
      saveProfile(formData);
    }
    clearDraft();
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [formData]);

  // Called when SubmitStep completes (either official or demo QR)
  const handleSubmit = useCallback(() => {
    // Encode data into URL for the confirmation page
    const encoded = encodeURIComponent(JSON.stringify(formData));
    router.push(`/confirmation?data=${encoded}`);
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
            onSubmit={handleReviewContinue}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <SubmitStep
            data={formData}
            onBack={handleBack}
            onComplete={handleSubmit}
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
