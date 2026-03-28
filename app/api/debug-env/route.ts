import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.OPENROUTER_API_KEY;
  const keyLength = process.env.OPENROUTER_API_KEY?.length ?? 0;
  const keyPrefix = process.env.OPENROUTER_API_KEY?.slice(0, 4) ?? "N/A";

  return NextResponse.json({
    hasKey,
    keyLength,
    keyPrefix,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("OPEN") || k.includes("ROUTER")),
  });
}
