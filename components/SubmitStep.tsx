"use client";

import { useState, useMemo, useEffect } from "react";
import { type FormData } from "@/lib/types";
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

interface Props {
  data: FormData;
  onSuccess: () => void;
  onBack: () => void;
}

function buildScript(data: FormData): string {
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

  return `(function(){var d=${JSON.stringify(payload)};function sv(n,v){var e=document.querySelector('[name="'+n+'"]');if(!e)return;e.value=v;var ev=['change','input'];ev.forEach(function(t){e.dispatchEvent(new Event(t,{bubbles:true}));});if(window.jQuery){window.jQuery(e).trigger('change').trigger('input');}}['name','passNo','dob','passExpDte','email','confirmEmail','region','mobile','arrDt','depDt','vesselNm','accommodationAddress1','accommodationAddress2','accommodationPostcode'].forEach(function(f){sv(f,d[f]);});['nationality','pob','sex','trvlMode','embark','accommodationStay','accommodationState'].forEach(function(f){sv(f,d[f]);});var at=0,iv=setInterval(function(){var ce=document.querySelector('[name="accommodationCity"]');if(!ce){if(++at>30)clearInterval(iv);return;}if(ce.options.length<=1){if(++at>30){clearInterval(iv);alert('Form filled! Please select your city manually, then solve the CAPTCHA and submit.');}return;}for(var i=0;i<ce.options.length;i++){if(ce.options[i].text.toLowerCase().indexOf(d.sCity.toLowerCase())!==-1){ce.value=ce.options[i].value;ce.dispatchEvent(new Event('change',{bubbles:true}));if(window.jQuery)window.jQuery(ce).trigger('change');clearInterval(iv);alert('Form filled! Solve the CAPTCHA, then click Submit.');return;}}clearInterval(iv);alert('Form filled! Select city "'+d.sCity+'" manually, then solve the CAPTCHA and submit.');},500);})();`;
}

type BrowserType = "firefox" | "safari" | "chrome";

export default function SubmitStep({ data, onBack, onSuccess }: Props) {
  const script = useMemo(() => buildScript(data), [data]);
  const bookmarkletHref = useMemo(() => `javascript:${encodeURIComponent(script)}`, [script]);

  const [copied, setCopied] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [browser, setBrowser] = useState<BrowserType>("chrome");
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const mac = navigator.platform.toUpperCase().includes("MAC");
    setIsMac(mac);
    if (ua.includes("Firefox/")) setBrowser("firefox");
    else if (ua.includes("Safari/") && !ua.includes("Chrome") && !ua.includes("Edg/")) setBrowser("safari");
    else setBrowser("chrome");
  }, []);

  const copyScript = () =>
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 30000);
    });

  const copyBookmarklet = () =>
    navigator.clipboard.writeText(bookmarkletHref).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 30000);
    });

  // Firefox & Safari: drag bookmarklet is easier (no paste protection, no Dev Tools setup)
  // Chrome/Edge: console paste is easier (no bookmark dance)
  const useBookmarkPrimary = browser === "firefox" || browser === "safari";

  const consoleShortcut = browser === "firefox"
    ? (isMac ? "Cmd + Option + K" : "Ctrl + Shift + K")
    : (isMac ? "Cmd + Option + J" : "Ctrl + Shift + J");

  const BookmarkSteps = () => (
    <>
      {/* Step 1 — drag bookmark */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">1</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Save the autofill bookmark</p>
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl">
            <span className="text-xs text-amber-700 font-medium flex-1">Drag to your bookmarks bar:</span>
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
          <p className="text-xs text-gray-500">
            Don&apos;t see your bookmarks bar? Press{" "}
            <kbd className="bg-gray-200 text-gray-800 text-xs font-mono px-1 py-0.5 rounded">
              {isMac ? "Cmd+Shift+B" : "Ctrl+Shift+B"}
            </kbd>{" "}
            to show it.
          </p>
        </div>
      </div>

      {/* Step 2 — open MDAC */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">2</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Open the MDAC form</p>
          <a
            href={MDAC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#003893] text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Official MDAC Site
          </a>
        </div>
      </div>

      {/* Step 3 — click bookmark */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">3</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Click the <strong>MDAC Autofill</strong> bookmark</p>
          <p className="text-sm text-gray-500 mt-0.5">The form fills instantly. A dialog will confirm when it&apos;s done.</p>
        </div>
      </div>

      {/* Step 4 — CAPTCHA */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">4</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Solve the CAPTCHA and submit</p>
          <p className="text-sm text-gray-500 mt-0.5">Slide the CAPTCHA, click Submit, and check your email for the PIN.</p>
        </div>
      </div>
    </>
  );

  const ConsoleSteps = () => (
    <>
      {/* Step 1 — open + copy */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">1</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Open the MDAC form</p>
          <button
            onClick={() => { copyScript(); window.open(MDAC_URL, "_blank", "noopener,noreferrer"); }}
            className="flex items-center justify-center gap-2 w-full bg-[#003893] text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open MDAC &amp; Copy Fill Code
          </button>
          {copied && (
            <p className="text-xs text-green-700 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Fill code copied!
            </p>
          )}
        </div>
      </div>

      {/* Step 2 — open console */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">2</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Open the browser console</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
            <p className="text-sm text-gray-700">
              In the MDAC tab, press{" "}
              <kbd className="bg-gray-200 text-gray-800 text-xs font-mono px-1.5 py-0.5 rounded">{consoleShortcut}</kbd>
            </p>
            <p className="text-xs text-gray-500">Opens DevTools directly on the Console tab.</p>
          </div>
        </div>
      </div>

      {/* Step 3 — paste */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">3</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Paste and press Enter</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
            <p className="text-sm text-gray-700">
              Click in the console, paste with{" "}
              <kbd className="bg-gray-200 text-gray-800 text-xs font-mono px-1.5 py-0.5 rounded">
                {isMac ? "Cmd+V" : "Ctrl+V"}
              </kbd>
              , then press{" "}
              <kbd className="bg-gray-200 text-gray-800 text-xs font-mono px-1.5 py-0.5 rounded">Enter</kbd>.
            </p>
            <p className="text-xs text-gray-500">The form fills instantly. A dialog confirms when done.</p>
          </div>
          {!copied && (
            <button onClick={copyScript} className="text-xs text-[#003893] font-semibold underline underline-offset-2">
              Didn&apos;t copy yet? Copy fill code
            </button>
          )}
        </div>
      </div>

      {/* Step 4 — CAPTCHA */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 w-6 h-6 bg-[#003893] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">4</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Solve the CAPTCHA and submit</p>
          <p className="text-sm text-gray-500 mt-0.5">Slide the CAPTCHA, click Submit, and check your email for the PIN.</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="step-enter space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Auto-fill the MDAC form</h3>
          <p className="text-sm text-gray-500 mt-1">
            We&apos;ll fill in all your details automatically — you just solve the CAPTCHA.
          </p>
        </div>

        {useBookmarkPrimary ? <BookmarkSteps /> : <ConsoleSteps />}

        {/* Alternative method — collapsed */}
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowAlt(!showAlt)}
            className="text-xs text-gray-400 font-medium flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showAlt ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {useBookmarkPrimary ? "Try the console method instead" : "Try the bookmark method instead"}
          </button>

          {showAlt && (
            <div className="mt-4 space-y-4">
              {useBookmarkPrimary ? (
                // Collapsed: show console steps for Firefox/Safari users
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    {browser === "firefox" && (
                      <p className="text-xs text-amber-800">
                        <strong>Firefox note:</strong> Before pasting, type{" "}
                        <kbd className="bg-amber-200 text-amber-900 text-xs font-mono px-1 py-0.5 rounded">allow pasting</kbd>{" "}
                        in the console (no Enter needed) — Firefox blocks paste by default.
                      </p>
                    )}
                    {browser === "safari" && (
                      <p className="text-xs text-amber-800">
                        <strong>Safari note:</strong> You must first enable the Developer menu: Safari → Settings → Advanced → &quot;Show features for web developers&quot;.
                      </p>
                    )}
                  </div>
                  <ConsoleSteps />
                </>
              ) : (
                // Collapsed: show bookmark steps for Chrome/Edge users
                <>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Save as bookmark (Chrome / Edge)</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Right-click your bookmarks bar → <strong>Add page…</strong> / <strong>Add favorite</strong></li>
                      <li>Name it <strong>MDAC Autofill</strong>, clear the URL field, paste the bookmark code.</li>
                      <li>Save — then click it on the MDAC form page.</li>
                    </ol>
                    <button onClick={copyBookmarklet} className="text-xs text-[#003893] font-semibold underline underline-offset-2">
                      {copied ? "Copied!" : "Copy bookmark code"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
        >
          Back
        </button>
        <button
          onClick={onSuccess}
          className="flex-1 bg-[#003893] text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
        >
          Done — I submitted ✓
        </button>
      </div>
    </div>
  );
}
