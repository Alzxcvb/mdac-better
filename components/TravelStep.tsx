"use client";

import { useState } from "react";
import { FormData, PORTS_OF_ENTRY, PURPOSES_OF_VISIT, PHONE_COUNTRY_CODES } from "@/lib/types";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}

function Field({ label, hint, children, required }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#CC0001] ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function TravelStep({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Arrival date limits: today up to 3 days from now
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.passportExpiry) e.passportExpiry = "Passport expiry date is required";
    if (!data.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      e.email = "Please enter a valid email address";
    }
    if (!data.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    if (!data.arrivalDate) e.arrivalDate = "Arrival date is required";
    if (!data.portOfEntry) e.portOfEntry = "Please select a port of entry";
    if (!data.purposeOfVisit) e.purposeOfVisit = "Please select a purpose of visit";
    if (!data.addressInMalaysia.trim()) e.addressInMalaysia = "Please provide your address or hotel in Malaysia";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-base bg-white transition-colors outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  const selectClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-base bg-white transition-colors outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] cursor-pointer ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="step-enter space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Travel Details</h2>
        <p className="text-sm text-gray-500 mt-1">About this specific trip to Malaysia</p>
      </div>

      {/* Passport Expiry */}
      <Field label="Passport Expiry Date" required>
        <input
          type="date"
          className={inputClass("passportExpiry")}
          value={data.passportExpiry}
          onChange={(e) => {
            onChange({ passportExpiry: e.target.value });
            if (errors.passportExpiry) setErrors({ ...errors, passportExpiry: undefined });
          }}
          min={minDate}
        />
        {errors.passportExpiry && (
          <p className="text-xs text-red-500 mt-1">{errors.passportExpiry}</p>
        )}
      </Field>

      {/* Email */}
      <Field label="Email Address" required>
        <input
          type="email"
          className={inputClass("email")}
          value={data.email}
          onChange={(e) => {
            onChange({ email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </Field>

      {/* Phone */}
      <Field label="Mobile Phone Number" required>
        <div className="flex gap-2">
          <select
            className="border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] cursor-pointer"
            value={data.phoneCountryCode}
            onChange={(e) => onChange({ phoneCountryCode: e.target.value })}
            style={{ minWidth: "95px" }}
          >
            {PHONE_COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.country}
              </option>
            ))}
          </select>
          <input
            type="tel"
            className={`flex-1 px-4 py-3 rounded-xl border text-base bg-white transition-colors outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] ${
              errors.phoneNumber ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
            value={data.phoneNumber}
            onChange={(e) => {
              onChange({ phoneNumber: e.target.value });
              if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
            }}
            placeholder="123456789"
            inputMode="tel"
            autoComplete="tel-national"
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
        )}
      </Field>

      {/* Arrival Date */}
      <Field
        label="Intended Date of Arrival"
        hint="Must be within the next 3 days"
        required
      >
        <input
          type="date"
          className={inputClass("arrivalDate")}
          value={data.arrivalDate}
          onChange={(e) => {
            onChange({ arrivalDate: e.target.value });
            if (errors.arrivalDate) setErrors({ ...errors, arrivalDate: undefined });
          }}
          min={minDate}
          max={maxDate}
        />
        {errors.arrivalDate && (
          <p className="text-xs text-red-500 mt-1">{errors.arrivalDate}</p>
        )}
      </Field>

      {/* Port of Entry */}
      <Field label="Port of Entry" required>
        <select
          className={selectClass("portOfEntry")}
          value={data.portOfEntry}
          onChange={(e) => {
            onChange({ portOfEntry: e.target.value });
            if (errors.portOfEntry) setErrors({ ...errors, portOfEntry: undefined });
          }}
        >
          <option value="">Select port of entry...</option>
          {PORTS_OF_ENTRY.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.portOfEntry && (
          <p className="text-xs text-red-500 mt-1">{errors.portOfEntry}</p>
        )}
      </Field>

      {/* Purpose of Visit */}
      <Field label="Purpose of Visit" required>
        <div className="grid grid-cols-2 gap-2">
          {PURPOSES_OF_VISIT.map((purpose) => (
            <button
              key={purpose}
              type="button"
              onClick={() => {
                onChange({ purposeOfVisit: purpose });
                if (errors.purposeOfVisit) setErrors({ ...errors, purposeOfVisit: undefined });
              }}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                data.purposeOfVisit === purpose
                  ? "border-[#003893] bg-[#003893] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {purpose}
            </button>
          ))}
        </div>
        {errors.purposeOfVisit && (
          <p className="text-xs text-red-500 mt-1">{errors.purposeOfVisit}</p>
        )}
      </Field>

      {/* Address in Malaysia */}
      <Field
        label="Address / Hotel in Malaysia"
        hint="Where you'll be staying"
        required
      >
        <textarea
          className={`w-full px-4 py-3 rounded-xl border text-base bg-white transition-colors outline-none focus:ring-2 focus:ring-[#003893]/20 focus:border-[#003893] resize-none ${
            errors.addressInMalaysia ? "border-red-400 bg-red-50" : "border-gray-200"
          }`}
          value={data.addressInMalaysia}
          onChange={(e) => {
            onChange({ addressInMalaysia: e.target.value });
            if (errors.addressInMalaysia) setErrors({ ...errors, addressInMalaysia: undefined });
          }}
          placeholder="e.g. Mandarin Oriental Hotel, Kuala Lumpur City Centre"
          rows={2}
        />
        {errors.addressInMalaysia && (
          <p className="text-xs text-red-500 mt-1">{errors.addressInMalaysia}</p>
        )}
      </Field>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-[#CC0001] hover:bg-red-700 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95"
        >
          Review
        </button>
      </div>
    </div>
  );
}
