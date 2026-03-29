"use client";

import { useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FormData } from "@/lib/types";

interface Props {
  data: FormData;
  onNewTrip: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

export default function QRConfirmation({ data, onNewTrip }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = JSON.stringify({
    name: data.fullName,
    passport: data.passportNumber,
    passportType: data.passportType,
    nationality: data.nationality,
    dob: data.dateOfBirth,
    sex: data.sex,
    issuingCountry: data.countryOfPassportIssuance,
    passportExpiry: data.passportExpiry,
    email: data.email,
    phone: `${data.phoneCountryCode}${data.phoneNumber}`,
    arrival: data.arrivalDate,
    departure: data.departureDate,
    transport: data.modeOfTransport,
    flightNo: data.flightNumber,
    address: `${data.hotelName}, ${data.addressInMalaysia}, ${data.cityInMalaysia}, ${data.stateInMalaysia} ${data.postalCode}`,
  });

  const handleDownload = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create a larger canvas with padding and label
    const padding = 24;
    const labelHeight = 60;
    const size = canvas.width;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = size + padding * 2;
    outputCanvas.height = size + padding * 2 + labelHeight;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Header stripe
    ctx.fillStyle = "#003893";
    ctx.fillRect(0, 0, outputCanvas.width, 8);

    // QR code
    ctx.drawImage(canvas, padding, padding + 8);

    // Name and date text
    ctx.fillStyle = "#111827";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.fullName, outputCanvas.width / 2, size + padding + 8 + 24);

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    ctx.fillText(
      `Arrival: ${formatDate(data.arrivalDate)}`,
      outputCanvas.width / 2,
      size + padding + 8 + 46
    );

    const link = document.createElement("a");
    link.download = `malaysia-arrival-${data.fullName.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = outputCanvas.toDataURL("image/png");
    link.click();
  }, [data]);

  return (
    <div className="step-enter">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Arrival Card</h2>
        <p className="text-gray-500 mt-1 text-sm">Ready to present at immigration</p>
      </div>

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

      {/* QR Code */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center mb-4">
        <div
          ref={qrRef}
          className="qr-container p-3 bg-white rounded-xl border border-gray-100"
        >
          <QRCodeCanvas
            value={qrValue}
            size={220}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#111827"
          />
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
          Present this QR code to immigration officers
          <br />
          or screenshot this screen
        </p>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="mt-4 flex items-center gap-2 text-[#003893] border-2 border-[#003893] font-semibold text-sm py-3 px-6 rounded-xl transition-all hover:bg-blue-50 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR Code
        </button>
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
          <span className="font-bold">Demo Only.</span> This is a proof-of-concept and not an official
          Malaysian government document. Not valid for actual immigration use.
        </p>
      </div>
    </div>
  );
}
