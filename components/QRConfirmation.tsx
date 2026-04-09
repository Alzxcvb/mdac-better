"use client";

import { FormData } from "@/lib/types";

interface Props {
  data: FormData;
  onNewTrip: () => void;
  submitted?: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

export default function QRConfirmation({ data, onNewTrip, submitted = false }: Props) {

  return (
    <div className="step-enter">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {submitted ? "Submission Complete" : "Your Arrival Card"}
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          {submitted
            ? "Check your email for your confirmation PIN"
            : "Review your details below"}
        </p>
      </div>

      {/* Email notice — only after server-side submission */}
      {submitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Check your email</p>
              <p className="text-xs text-blue-700 mt-0.5">
                A PIN code has been sent to <strong>{data.email}</strong>.
                You&apos;ll need this PIN to retrieve your official arrival card QR code.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Traveler info banner */}
      <div className="bg-[#003893] text-white rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold">
            {data.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">{data.fullName}</p>
          <p className="text-blue-200 text-sm">
            Arriving {formatDate(data.arrivalDate)}
          </p>
          <p className="text-blue-200 text-xs mt-0.5">{data.modeOfTransport} — {data.flightNumber}</p>
        </div>
      </div>

      {/* Passport details strip */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium">Passport</p>
            <p className="font-semibold text-gray-900 mt-0.5">{data.passportNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Nationality</p>
            <p className="font-semibold text-gray-900 mt-0.5">{data.nationality}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Transport</p>
            <p className="font-semibold text-gray-900 mt-0.5">{data.modeOfTransport} — {data.flightNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Passport Expiry</p>
            <p className="font-semibold text-gray-900 mt-0.5">{formatDate(data.passportExpiry)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onNewTrip}
        className="w-full bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95 hover:border-gray-300 mb-4"
      >
        Fill for Another Trip
      </button>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        <p className="text-xs text-yellow-800 text-center leading-relaxed">
          {submitted ? (
            <>
              Your form has been submitted to the official Malaysian Digital Arrival Card system.
              This tool is <strong>not affiliated</strong> with the Malaysian government.
            </>
          ) : (
            <>
              <span className="font-bold">Demo Only.</span> This is a proof-of-concept and not an official
              Malaysian government document.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
