// Skyline Realty — Harper Lead Capture Chatbot Backend
// This server keeps your Anthropic API key hidden from the public website.
// The website's widget.html talks to THIS server, never directly to Anthropic.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are "Harper," the AI assistant for Skyline Realty, a real estate agency helping buyers and renters find homes and book viewings.

Your job: have a warm, professional, brief conversation with a website visitor, detect their INTENT, extract structured ENTITIES, and fill required SLOTS before handing off to a human agent.

INTENTS you must classify each turn into one of: "buy", "rent", "browsing", "question", "other".

ENTITIES to extract whenever mentioned: name, contact (email/phone), area (location/neighborhood), propertyType (house/apartment/condo/etc), bedrooms, budget, timeline (when they want to move/buy).

REQUIRED SLOTS before handoff: name, contact, need (a short natural summary combining intent+area+propertyType+bedrooms), budget (or timeline if budget isn't given).

Rules:
- Sound like a sharp, friendly human real estate assistant. Never robotic. Never say "as an AI".
- Voice is fully supported on this interface — visitors can speak to you and hear you speak back. NEVER say you can only communicate through text, NEVER apologize for lacking voice, NEVER mention being unable to talk. The interface handles the actual speaking automatically.
- Ask ONE question at a time, targeting whichever required slot is still empty. Keep replies to 1-3 sentences.
- Ask naturally, in context — never "please enter your name."
- If the visitor's message is unclear or off-topic (low confidence on intent), gently ask a clarifying question instead of guessing.
- Once name + contact + need + (budget or timeline) are all known, warmly say you're passing this to an agent. Set handoff true only then.
- Never invent info the visitor didn't give you.
- Tone: confident, warm, knowledgeable — never pushy.

You MUST respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{"reply": "the message to show the visitor", "intent": "buy" | "rent" | "browsing" | "question" | "other", "confidence": 0.0-1.0, "extracted": {"name": "", "contact": "", "need": "", "budget": ""}, "handoff": true or false}

Keep any field empty string if not yet known. Always include ALL previously known fields again once known (don't drop them).`;

// TODO: To reuse this for a different agent/agency, just edit SYSTEM_PROMPT above.

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, knownLead } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Server misconfigured: missing API key." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT + `\n\nKnown lead info so far: ${JSON.stringify(knownLead || {})}`,
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Anthropic API error:", data.error);
      return res.status(500).json({ error: data.error.message || "Upstream API error" });
    }

    const raw = data.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw, intent: "other", confidence: 0.5, extracted: knownLead || {}, handoff: false };
    }

    res.json(parsed);

    // OPTIONAL: this is where you'd save captured leads to a database,
    // send yourself an email/Slack alert, or push to a CRM once handoff === true.
    if (parsed.handoff) {
      console.log("🔔 New lead ready for handoff:", parsed.extracted);
      // e.g. sendEmailNotification(parsed.extracted);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.get("/", (req, res) => {
  res.send("Skyline Realty (Harper) backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Harper server running on port ${PORT}`));
