/**
 * Custom analytics events for funnel tracking.
 * Uses Vercel Web Analytics track() — no PII is sent.
 *
 * Events:
 *   app_opened       — Landing page viewed
 *   profile_saved    — User saved their profile for next trip
 *   form_started     — User began filling the form (step 1)
 *   form_step        — User advanced to a form step (step number tracked)
 *   qr_generated     — User reached the submit/autofill step
 *   submission_done  — User indicated they submitted on the official site
 */

import { track } from "@vercel/analytics";

export function trackAppOpened(hasProfile: boolean) {
  track("app_opened", { has_profile: hasProfile ? "yes" : "no" });
}

export function trackFormStarted(mode: string) {
  track("form_started", { mode });
}

export function trackFormStep(step: number) {
  track("form_step", { step: String(step) });
}

export function trackProfileSaved() {
  track("profile_saved");
}

export function trackQrGenerated() {
  track("qr_generated");
}

export function trackSubmissionDone() {
  track("submission_done");
}
