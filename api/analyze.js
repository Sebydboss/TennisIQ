// ============================================================
//  Tennis IQ — Vercel Serverless Function
//  This file runs on VERCEL'S servers, not the user's browser.
//  That's why the API key stays secret — users never see this.
// ============================================================

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel injects your API key from the dashboard environment variables
  // You never hardcode it here — it lives only in Vercel's settings
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  // Get the image data sent from the frontend
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "No image provided" });
  }

  // ✏️ -------------------------------------------------------
  //  EDIT YOUR PROMPT HERE
  //  This is exactly what Claude reads before looking at the image.
  //  Change this to adjust what Claude focuses on, the tone,
  //  extra categories, anything you want.
  // ----------------------------------------------------------
  const prompt = `You are an expert tennis coach who has trained ATP and WTA professionals.
A player has uploaded a frame from their serve video for analysis.

Study the image carefully and analyze their serve technique.

Respond ONLY with a valid JSON object in this exact format — no extra text, no markdown, just the JSON:
{
  "technique": "One sentence about their overall body position, stance, and form",
  "power": "One sentence about power generation — hip rotation, leg drive, and arm extension",
  "fixes": "The single most important thing they should fix immediately",
  "rating": "A number from 1 to 10 rating their overall serve form",
  "proComparison": "One sentence comparing their style to a specific pro (Federer, Serena, Djokovic, etc)"
}`;
  // ✏️ End of prompt — edit above this line ---------------------

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || "Claude API error" });
    }

    const data = await response.json();
    const rawText = data.content[0].text;

    // Parse Claude's JSON response safely
    let analysis;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      // If Claude didn't return perfect JSON, wrap it so the app doesn't crash
      analysis = {
        technique: rawText,
        power: "—",
        fixes: "—",
        rating: "—",
        proComparison: "—"
      };
    }

    return res.status(200).json(analysis);

  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
