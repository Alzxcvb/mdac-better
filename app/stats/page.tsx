import { notFound } from "next/navigation";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

export const dynamic = "force-dynamic";

const FUNNEL_EVENTS = [
  ANALYTICS_EVENTS.step1Complete,
  ANALYTICS_EVENTS.step2Complete,
  ANALYTICS_EVENTS.step3ReviewSubmit,
  ANALYTICS_EVENTS.submitOpenedMdac,
  ANALYTICS_EVENTS.userConfirmedSubmitted,
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function StatsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const adminKey = process.env.ADMIN_STATS_KEY;
  const providedKey = readParam(searchParams.key);

  if (!adminKey || providedKey !== adminKey) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MDAC Better Stats</h1>
          <p className="mt-2 text-sm text-gray-600">
            This page is intentionally thin. Use the Vercel Analytics dashboard for counts and trends;
            use the event map below to interpret completion versus drop-off.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Primary Funnel
          </h2>
          <div className="mt-4 space-y-3">
            {FUNNEL_EVENTS.map((eventName, index) => (
              <div key={eventName} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#003893] text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-mono text-sm text-gray-900">{eventName}</p>
                  <p className="text-xs text-gray-500">
                    {eventName === ANALYTICS_EVENTS.step1Complete && "Personal details validated and user moved to travel step."}
                    {eventName === ANALYTICS_EVENTS.step2Complete && "Travel details validated and user moved to review."}
                    {eventName === ANALYTICS_EVENTS.step3ReviewSubmit && "User approved the review step and entered submission instructions."}
                    {eventName === ANALYTICS_EVENTS.submitOpenedMdac && "User opened the official Malaysian MDAC site from the helper flow."}
                    {eventName === ANALYTICS_EVENTS.userConfirmedSubmitted && "User reported finishing the official submission flow."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Supporting Events
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {Object.values(ANALYTICS_EVENTS)
              .filter((eventName) => !FUNNEL_EVENTS.includes(eventName as (typeof FUNNEL_EVENTS)[number]))
              .map((eventName) => (
                <div key={eventName} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="font-mono text-sm text-gray-900">{eventName}</p>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-900">
            Operator Notes
          </h2>
          <div className="mt-3 space-y-2 text-sm text-blue-900">
            <p>Open Vercel Analytics for this project and inspect custom events by name.</p>
            <p>The best quick completion metric is `user_confirmed_submitted / step_1_complete`.</p>
            <p>The best quick drop-off check is the last funnel event a session reaches before disappearing.</p>
            <p>Segment `submit_method_chosen`, `submit_opened_mdac`, and `submit_copied_script` by `method` to compare bookmark versus console usage.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
