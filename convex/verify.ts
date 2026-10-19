import { httpAction } from "./_generated/server";

// Gemini 2.0 Flash multimodal proof verification
// Called from the app as a POST to the Convex site URL.
// Request body (JSON):
//   { proofType: "photo" | "photo_before_after" | "audio", challengeTitle: string, base64: string, mimeType: string, base64After?: string }
// Response body (JSON):
//   { verified: boolean, reason: string }

const GEMINI_MODEL = "gemini-2.5-flash";

function buildPrompt(proofType: string, challengeTitle: string): string {
  if (proofType === "photo") {
    return (
      `You are a gentle wellness proof verifier. The user completed a self-care challenge called "${challengeTitle}". ` +
      `Look at the photo and decide if it plausibly shows evidence of completing that kind of activity. ` +
      `Be lenient — the goal is genuine engagement, not perfection. ` +
      `Reply with JSON only: {"verified": true/false, "reason": "one short sentence"}`
    );
  }
  if (proofType === "photo_before_after") {
    return (
      `You are a gentle wellness proof verifier. The user completed a self-care challenge called "${challengeTitle}". ` +
      `Two photos are provided: the first is BEFORE, the second is AFTER. ` +
      `Check if the after state looks meaningfully different from the before state in a way consistent with the challenge. ` +
      `Be lenient — small improvements count. ` +
      `Reply with JSON only: {"verified": true/false, "reason": "one short sentence"}`
    );
  }
  if (proofType === "audio") {
    return (
      `You are a gentle wellness proof verifier. The user completed a self-care challenge called "${challengeTitle}" ` +
      `and recorded audio as proof. Listen to the clip — any sound (humming, singing, speaking, breathing exercises) counts. ` +
      `Just confirm there is actual audio content (not silence). ` +
      `Reply with JSON only: {"verified": true/false, "reason": "one short sentence"}`
    );
  }
  return `Reply with JSON only: {"verified": true, "reason": "Proof type does not require AI verification."}`;
}

export const verifyProof = httpAction(async (ctx, request) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: {
    proofType: string;
    challengeTitle: string;
    base64: string;
    mimeType: string;
    base64After?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { proofType, challengeTitle, base64, mimeType, base64After } = body;

  if (!proofType || !challengeTitle || !base64 || !mimeType) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build Gemini parts
  const parts: object[] = [
    { text: buildPrompt(proofType, challengeTitle) },
    { inlineData: { mimeType, data: base64 } },
  ];

  // For before/after, include the second image
  if (proofType === "photo_before_after" && base64After) {
    parts.push({ inlineData: { mimeType, data: base64After } });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.1,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        verified: false,
        reason: "Could not reach AI service.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error("Gemini error:", errText);
    return new Response(
      JSON.stringify({ verified: false, reason: "AI verification failed." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const geminiData = await geminiRes.json();

  console.log(
    "[verify] raw gemini response:",
    JSON.stringify(geminiData).slice(0, 500),
  );

  let result = { verified: true, reason: "Proof looks good." };
  try {
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("[verify] extracted text:", text);

    if (!text) {
      throw new Error("empty text from Gemini");
    }

    // Strip markdown code fences if present (```json ... ```)
    const clean = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    result = JSON.parse(clean);
  } catch (e) {
    console.error("[verify] parse error:", e);
    result = {
      verified: true,
      reason: "Could not parse AI response — proof accepted.",
    };
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
