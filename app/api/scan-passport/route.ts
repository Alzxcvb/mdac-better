import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

const PROMPT = `Extract passport information from this image. Read both the visible text fields AND the MRZ (machine readable zone) at the bottom if present.

Return ONLY a JSON object with these exact fields (omit any you cannot read clearly):
{
  "fullName": "FIRSTNAME LASTNAME" (all caps, given names first then surname),
  "passportNumber": "...",
  "nationality": "..." (as a demonym like "American", "British", "Malaysian", etc.),
  "dateOfBirth": "YYYY-MM-DD",
  "sex": "Male" or "Female",
  "passportExpiry": "YYYY-MM-DD",
  "passportIssueDate": "YYYY-MM-DD"
}

Return ONLY the JSON. No markdown, no explanation.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Passport scanning not configured. OPENROUTER_API_KEY is missing." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mdac-better.vercel.app",
        "X-Title": "MDAC Better",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${base64}` },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${err}`);
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";

    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to scan passport: ${message}` },
      { status: 500 }
    );
  }
}
