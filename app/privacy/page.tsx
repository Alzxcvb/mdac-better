import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MDAC Better",
  description:
    "Privacy policy for MDAC Better — the web app and Chrome extension for filling out the Malaysia Digital Arrival Card.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero band */}
      <div className="bg-[#003893] text-white px-6 pt-12 pb-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-48 h-48 rounded-full border-4 border-white" />
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-white" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>Back to MDAC Better</span>
          </Link>
          <h1 className="text-3xl font-bold leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-blue-200 text-base">
            Covers both the MDAC Better web app and the Chrome extension.
          </p>
          <p className="text-blue-200/70 text-sm mt-2">
            Effective date: May 4, 2026
          </p>
        </div>
      </div>

      {/* Wave divider */}
      <div className="bg-[#003893]">
        <svg
          viewBox="0 0 375 30"
          className="w-full"
          preserveAspectRatio="none"
          height="30"
        >
          <path
            d="M0 30 L0 15 Q93.75 0 187.5 15 Q281.25 30 375 15 L375 30 Z"
            fill="#f8f9fb"
          />
        </svg>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        <p className="text-gray-700 text-base leading-relaxed mb-8">
          Short version: MDAC Better doesn&apos;t have a backend that stores
          your profile. Everything you type stays on your device. We don&apos;t
          run ads, we don&apos;t sell data, and we don&apos;t share it with
          anyone. The longer version is below.
        </p>

        {/* What we collect */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            What we collect
          </h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed">
            <li>
              <strong className="text-gray-900">
                Profile data you type into the form
              </strong>{" "}
              — things like your name, passport number, dates of travel, and
              other arrival-card fields. The web app keeps this in your
              browser&apos;s <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">localStorage</code>.
              The Chrome extension keeps it in{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">chrome.storage.local</code>.
              In both cases the data lives on your device and never leaves it.
            </li>
            <li>
              <strong className="text-gray-900">Vercel Analytics</strong> on
              the web app — anonymous page-view stats only (which pages get
              loaded, roughly where in the world). No personal info, no
              cookies that identify you. The Chrome extension uses no
              analytics.
            </li>
          </ul>
        </section>

        {/* What we DON'T collect */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            What we don&apos;t collect
          </h2>
          <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-5">
            <li>No accounts. There&apos;s nothing to sign up for.</li>
            <li>
              No server that receives your profile data. There&apos;s no
              database on our end, because there&apos;s no &ldquo;our end&rdquo; to send it
              to.
            </li>
            <li>No third-party trackers, no advertising, no ad networks.</li>
            <li>No remote code loading.</li>
            <li>We don&apos;t sell or share your data with anyone.</li>
            <li>
              The Chrome extension makes <strong>zero outbound network requests</strong>.
              It only injects into{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                imigresen-online.imi.gov.my/mdac/*
              </code>{" "}
              to fill the official form for you.
            </li>
          </ul>
        </section>

        {/* Chrome extension permissions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Chrome extension permissions
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Here&apos;s every permission the extension asks for and why it
            needs it:
          </p>
          <ul className="space-y-2 text-gray-700 leading-relaxed">
            <li>
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">storage</code>{" "}
              — save your profile locally on your device.
            </li>
            <li>
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">activeTab</code>{" "}
              — read and write the active MDAC tab when you click &ldquo;Fill&rdquo;.
            </li>
            <li>
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">scripting</code>{" "}
              — inject the autofill script into the MDAC page.
            </li>
            <li>
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">tabs</code>{" "}
              — open the MDAC site for you if you don&apos;t already have it
              open.
            </li>
            <li>
              <strong className="text-gray-900">Host permission</strong> for{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                imigresen-online.imi.gov.my
              </code>{" "}
              — the only site where the content script ever runs.
            </li>
          </ul>
        </section>

        {/* Data deletion */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Deleting your data
          </h2>
          <ul className="space-y-2 text-gray-700 leading-relaxed">
            <li>
              <strong className="text-gray-900">Web app:</strong> clear your
              browser&apos;s site data for{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">
                mdac-better.vercel.app
              </code>
              , or use the &ldquo;Clear profile&rdquo; control if your build
              has one.
            </li>
            <li>
              <strong className="text-gray-900">Chrome extension:</strong>{" "}
              uninstall the extension, or use the popup&apos;s clear-profile
              control to wipe the saved profile.
            </li>
          </ul>
        </section>

        {/* Children */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Children</h2>
          <p className="text-gray-700 leading-relaxed">
            MDAC Better isn&apos;t directed at children under 13, and we
            don&apos;t knowingly collect data from them.
          </p>
        </section>

        {/* Updates */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Updates to this policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We will note any changes here. Effective date: May 4, 2026.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Questions, concerns, or just want to say hi? Email{" "}
            <a
              href="mailto:claude.com@email.acoffman.org"
              className="text-[#003893] font-medium underline underline-offset-2 hover:text-[#002970]"
            >
              claude.com@email.acoffman.org
            </a>
            .
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#003893] font-medium hover:text-[#002970] transition-colors"
          >
            <span>Back to MDAC Better</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
