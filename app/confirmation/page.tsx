"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRConfirmation from "@/components/QRConfirmation";
import { type FormData } from "@/lib/types";
import { resetTripFields } from "@/lib/storage";
import {
  NATIONALITY_TO_ISO3,
  COUNTRY_TO_ISO3,
  STATE_TO_CODE,
  TRANSPORT_TO_CODE,
  SEX_TO_CODE,
  toMdacDate,
  phoneCodeToRegion,
} from "@/lib/mdac-codes";

const MDAC_URL = "https://imigresen-online.imi.gov.my/mdac/main?registerMain";

// ---- Bookmarklet builder ----

function buildBookmarkletScript(data: FormData): string {
  const natCode = NATIONALITY_TO_ISO3[data.nationality] || "";
  const pobCode = COUNTRY_TO_ISO3[data.placeOfBirth] || natCode;
  const stateCode = STATE_TO_CODE[data.stateInMalaysia] || "";
  const transportCode = TRANSPORT_TO_CODE[data.modeOfTransport] || "";
  const embarkCode = COUNTRY_TO_ISO3[data.departureCountry] || "";
  const regionNum = phoneCodeToRegion(data.phoneCountryCode);
  const sexCode = SEX_TO_CODE[data.sex] || "";

  const payload = {
    name: data.fullName.toUpperCase().slice(0, 60),
    passNo: data.passportNumber.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12),
    dob: toMdacDate(data.dateOfBirth),
    nationality: natCode,
    pob: pobCode,
    sex: sexCode,
    passExpDte: toMdacDate(data.passportExpiry),
    email: data.email,
    confirmEmail: data.email,
    region: regionNum,
    mobile: data.phoneNumber.replace(/\D/g, "").slice(0, 12),
    arrDt: toMdacDate(data.arrivalDate),
    depDt: toMdacDate(data.departureDate),
    vesselNm: data.flightNumber.slice(0, 30),
    trvlMode: transportCode,
    embark: embarkCode,
    accommodationStay: "01",
    accommodationAddress1: data.hotelName.slice(0, 100),
    accommodationAddress2: data.addressInMalaysia.slice(0, 100),
    accommodationState: stateCode,
    accommodationPostcode: data.postalCode.replace(/\D/g, "").slice(0, 5),
    sCity: data.cityInMalaysia,
  };

  const script = `(function(){var d=${JSON.stringify(payload)};function sv(n,v){var e=document.querySelector('[name="'+n+'"]');if(!e)return;e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new Event('input',{bubbles:true}));}['name','passNo','dob','passExpDte','email','confirmEmail','region','mobile','arrDt','depDt','vesselNm','accommodationAddress1','accommodationAddress2','accommodationPostcode'].forEach(function(f){sv(f,d[f]);});['nationality','pob','sex','trvlMode','embark','accommodationStay','accommodationState'].forEach(function(f){sv(f,d[f]);});var at=0,iv=setInterval(function(){var ce=document.querySelector('[name="accommodationCity"]');if(!ce){if(++at>30)clearInterval(iv);return;}if(ce.options.length<=1){if(++at>30){clearInterval(iv);alert('Form filled! Please select your city manually, then solve the CAPTCHA and submit.');}return;}for(var i=0;i<ce.options.length;i++){if(ce.options[i].text.toLowerCase().indexOf(d.sCity.toLowerCase())!==-1){ce.value=ce.options[i].value;ce.dispatchEvent(new Event('change',{bubbles:true}));clearInterval(iv);alert('Form filled! Solve the CAPTCHA, then click Submit.');return;}}clearInterval(iv);alert('Form filled! Select city "'+d.sCity+'" manually, then solve the CAPTCHA and submit.');},500);})();`;

  return `javascript:${encodeURIComponent(script)}`;
}

type BrowserKey = "firefox" | "safari" | "chrome" | "edge";

const BROWSER_STEPS: Record<BrowserKey, { label: string; canDrag: boolean; steps: string[] }> = {
  firefox: {
    label: "Firefox",
    canDrag: true,
    steps: [
      'Drag the <strong>MDAC Autofill</strong> button below directly to your bookmarks bar.',
      "OR: Right-click bookmarks bar → <strong>Add Bookmark…</strong> → paste the copied code in the <strong>Location</strong> field → Save",
    ],
  },
  safari: {
    label: "Safari",
    canDrag: true,
    steps: [
      'Drag the <strong>MDAC Autofill</strong> button below directly to your bookmarks bar.',
      "OR: Bookmarks menu → <strong>Add Bookmark</strong> → after saving, right-click it → Edit Address → paste the copied code → Save",
    ],
  },
  chrome: {
    label: "Chrome",
    canDrag: false,
    steps: [
      "Right-click your bookmarks bar → <strong>Add page…</strong>",
      'Name it <strong>MDAC Autofill</strong>, select all in the URL field and <strong>paste the copied code</strong>, then click Save.',
    ],
  },
  edge: {
    label: "Edge",
    canDrag: false,
    steps: [
      "Right-click your bookmarks bar → <strong>Add favorite</strong>",
      'Name it <strong>MDAC Autofill</strong>, select all in the URL field and <strong>paste the copied code</strong>, then click Save.',
    ],
  },
};

// ---- Device Submit Section (bookmarklet) ----

function DeviceSubmitSection({ data }: { data: FormData }) {
  const bookmarkletHref = useMemo(() => buildBookmarkletScript(data), [data]);
  const [copied, setCopied] = useState(false);
  const [browser, setBrowser] = useState<BrowserKey>("chrome");

  // Auto-detect browser on mount
  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) setBrowser("edge");
    else if (ua.includes("Firefox/")) setBrowser("firefox");
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) setBrowser("safari");
    else setBrowser("chrome");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletHref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 15000);
    });
  };

  const { canDrag, steps } = BROWSER_STEPS[browser];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900">Submit to Official MDAC</h3>
        <p className="text-sm text-gray-500 mt-1">
          Save a one-click autofill tool to your bookmarks, then use it on the official MDAC site.
        </p>
      </div>

      {/* Browser selector */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your browser</p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(BROWSER_STEPS) as BrowserKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setBrowser(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                browser === key
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {BROWSER_STEPS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">1</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Copy the autofill code</p>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 w-full font-semibold text-sm py-3 rounded-xl transition-all active:scale-95 border ${
              copied
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-[#003893] border-[#003893] text-white"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy autofill code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">2</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Save it as a bookmark</p>

          {/* Drag target — only shown for Firefox / Safari */}
          {canDrag && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl">
              <span className="text-xs text-amber-700 font-medium flex-1">Drag to bookmarks bar:</span>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href={bookmarkletHref}
                className="flex-shrink-0 bg-[#003893] text-white text-sm font-bold px-4 py-2 rounded-lg select-none cursor-grab active:cursor-grabbing"
                onClick={(e) => e.preventDefault()}
                draggable={true}
              >
                MDAC Autofill
              </a>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            {steps.map((step, i) => (
              <p
                key={i}
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: (canDrag && i === 0 ? "Or: " : "") + step }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">3</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Open MDAC and click the bookmark</p>
          <p className="text-sm text-gray-600">Your form fills in seconds. Solve the slider CAPTCHA, click Submit, and check your email for the PIN.</p>
          <a
            href={MDAC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
          >
            Open Official MDAC Site
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ---- QR View ----

function QRView({ data, onNewTrip }: { data: FormData; onNewTrip: () => void }) {
  return (
    <div className="space-y-4">
      <QRConfirmation data={data} onNewTrip={onNewTrip} />
      <DeviceSubmitSection data={data} />
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
