"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface CaptchaSolverProps {
  imageBase64: string;
  width: number;
  height: number;
  onSolve: (sliderX: number) => void;
  disabled?: boolean;
}

/**
 * Renders the CAPTCHA image relayed from the server and provides a
 * draggable slider so the user can position the puzzle piece.
 * Works with both mouse and touch events.
 */
export default function CaptchaSolver({
  imageBase64,
  width,
  height,
  onSolve,
  disabled = false,
}: CaptchaSolverProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sliderPos, setSliderPos] = useState(0); // 0..1
  const [submitted, setSubmitted] = useState(false);

  // Scale factor: display at max 100% width, capped at 340px
  const maxDisplay = 340;
  const scale = Math.min(1, maxDisplay / width);
  const displayW = width * scale;
  const displayH = height * scale;

  const getPositionFromEvent = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(1, x / rect.width));
    },
    []
  );

  // Mouse handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || submitted) return;
      e.preventDefault();
      setDragging(true);
      setSliderPos(getPositionFromEvent(e.clientX));
    },
    [disabled, submitted, getPositionFromEvent]
  );

  // Touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || submitted) return;
      setDragging(true);
      setSliderPos(getPositionFromEvent(e.touches[0].clientX));
    },
    [disabled, submitted, getPositionFromEvent]
  );

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      setSliderPos(getPositionFromEvent(clientX));
    };

    const onUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, getPositionFromEvent]);

  const handleSubmit = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    // Convert 0..1 position to pixel offset relative to the original CAPTCHA width
    const pixelOffset = Math.round(sliderPos * width);
    onSolve(pixelOffset);
  };

  return (
    <div className="space-y-4">
      {/* CAPTCHA image */}
      <div
        className="rounded-xl overflow-hidden border border-gray-200 mx-auto"
        style={{ width: displayW, height: displayH }}
      >
        <img
          src={`data:image/png;base64,${imageBase64}`}
          alt="Slide to verify"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Slider track */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 text-center font-medium">
          Drag the slider to complete the puzzle
        </p>
        <div
          ref={trackRef}
          className={`relative h-12 rounded-xl border-2 select-none ${
            disabled || submitted
              ? "bg-gray-100 border-gray-200"
              : "bg-gray-50 border-gray-300 cursor-pointer"
          }`}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-lg bg-[#003893]/10 transition-none"
            style={{ width: `${sliderPos * 100}%` }}
          />

          {/* Handle */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg shadow-md flex items-center justify-center transition-none ${
              disabled || submitted
                ? "bg-gray-300"
                : dragging
                ? "bg-[#003893] text-white scale-110"
                : "bg-white border-2 border-[#003893] text-[#003893]"
            }`}
            style={{ left: `calc(${sliderPos * 100}% - 20px)` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || submitted || sliderPos < 0.05}
        className={`w-full font-semibold text-sm py-3 rounded-xl transition-all active:scale-95 ${
          disabled || submitted || sliderPos < 0.05
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#003893] text-white hover:bg-blue-900"
        }`}
      >
        {submitted ? "Verifying..." : "Confirm Position"}
      </button>
    </div>
  );
}
