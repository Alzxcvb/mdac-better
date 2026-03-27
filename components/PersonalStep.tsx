"use client";

import { useState } from "react";
import { FormData, NATIONALITIES } from "@/lib/types";

interface Props {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  onNext: () => void;
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

export default function PersonalStep({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [natSearch, setNatSearch] = useState(data.nationality);
  const [showNatDropdown, setShowNatDropdown] = useState(false);

  const filteredNats = NATIONALITIES.filter((n) =>
    n.toLowerCase().includes(natSearch.toLowerCase())
  );

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.fullName.trim()) e.fullName = "Full name is required";
    if (!data.passportNumber.trim()) e.passportNumber = "Passport number is required";
    if (!data.nationality) e.nationality = "Please select your nationality";
    if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!data.sex) e.sex = "Please select your sex";
    if (!data.countryOfResidence.trim()) e.countryOfResidence = "Country of residence is required";
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

  return (
    <div className="step-enter space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-sm text-gray-500 mt-1">As it appears in your passport</p>
      </div>

      {/* Full Name */}
      <Field label="Full Name" hint="Exactly as shown in your passport" required>
        <input
          type="text"
          className={inputClass("fullName")}
          value={data.fullName}
          onChange={(e) => {
            onChange({ fullName: e.target.value });
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          placeholder="e.g. JOHN SMITH"
          autoCapitalize="characters"
          autoComplete="name"
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
        )}
      </Field>

      {/* Passport Number */}
      <Field label="Passport Number" required>
        <input
          type="text"
          className={inputClass("passportNumber")}
          value={data.passportNumber}
          onChange={(e) => {
            onChange({ passportNumber: e.target.value.toUpperCase() });
            if (errors.passportNumber) setErrors({ ...errors, passportNumber: undefined });
          }}
          placeholder="e.g. A12345678"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
        />
        {errors.passportNumber && (
          <p className="text-xs text-red-500 mt-1">{errors.passportNumber}</p>
        )}
      </Field>

      {/* Nationality — searchable */}
      <Field label="Nationality" required>
        <div className="relative">
          <input
            type="text"
            className={`${inputClass("nationality")} pr-10`}
            value={natSearch}
            onChange={(e) => {
              setNatSearch(e.target.value);
              onChange({ nationality: "" });
              setShowNatDropdown(true);
              if (errors.nationality) setErrors({ ...errors, nationality: undefined });
            }}
            onFocus={() => setShowNatDropdown(true)}
            onBlur={() => setTimeout(() => setShowNatDropdown(false), 150)}
            placeholder="Type to search..."
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          {showNatDropdown && filteredNats.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {filteredNats.map((nat) => (
                <button
                  key={nat}
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-[#003893] transition-colors first:rounded-t-xl last:rounded-b-xl"
                  onMouseDown={() => {
                    onChange({ nationality: nat });
                    setNatSearch(nat);
                    setShowNatDropdown(false);
                    setErrors({ ...errors, nationality: undefined });
                  }}
                >
                  {nat}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.nationality && (
          <p className="text-xs text-red-500 mt-1">{errors.nationality}</p>
        )}
      </Field>

      {/* Date of Birth */}
      <Field
        label="Date of Birth"
        hint="Use the date picker below — no clicking through 60 years"
        required
      >
        <div className="relative">
          <input
            type="date"
            className={inputClass("dateOfBirth")}
            value={data.dateOfBirth}
            onChange={(e) => {
              onChange({ dateOfBirth: e.target.value });
              if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: undefined });
            }}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
        )}
        <p className="text-xs text-[#003893] mt-1 flex items-center gap-1">
          <span>✓</span>
          <span>Fixed: native date input — just tap and pick</span>
        </p>
      </Field>

      {/* Sex */}
      <Field label="Sex" required>
        <div className="flex gap-3">
          {(["Male", "Female"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange({ sex: option });
                if (errors.sex) setErrors({ ...errors, sex: undefined });
              }}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.sex === option
                  ? "border-[#003893] bg-[#003893] text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.sex && <p className="text-xs text-red-500 mt-1">{errors.sex}</p>}
      </Field>

      {/* Country of Residence */}
      <Field label="Country of Residence" required>
        <input
          type="text"
          className={inputClass("countryOfResidence")}
          value={data.countryOfResidence}
          onChange={(e) => {
            onChange({ countryOfResidence: e.target.value });
            if (errors.countryOfResidence) setErrors({ ...errors, countryOfResidence: undefined });
          }}
          placeholder="e.g. Singapore"
          autoComplete="country-name"
        />
        {errors.countryOfResidence && (
          <p className="text-xs text-red-500 mt-1">{errors.countryOfResidence}</p>
        )}
      </Field>

      <button
        onClick={handleNext}
        className="w-full bg-[#CC0001] hover:bg-red-700 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-95 mt-2"
      >
        Next: Travel Details
      </button>
    </div>
  );
}
