# Harper (Skyline Realty) — Deploy & Integrate Guide

This package has everything needed to put Harper — with WORKING voice input and output — onto a real website.

## Why the mic didn't work in the Claude.ai demo, but will work here
Claude.ai artifacts run inside a security sandbox that often blocks microphone
access entirely, silently, with no error. A real website has none of that
restriction — once this is deployed with HTTPS (which every host below gives
you automatically), the mic will prompt for permission normally and work like
any other voice-enabled website (e.g. Siri-style voice search bars).

## What's in this folder
- `server.js` — the backend that talks to the AI safely (keeps your API key hidden)
- `package.json` — tells the server what to install
- `.env.example` — where your secret API key goes
- `widget.html` — the actual chat bubble with mic input + voice output, ready to paste onto a client's site

## Step 1 — Get an Anthropic API key
1. Go to https://console.anthropic.com and sign up.
2. Settings → API Keys → Create Key. Copy it somewhere safe.
3. Billed by usage — cheap for normal chat volume. Set a spending limit if you want peace of mind.

## Step 2 — Get the server online (Render.com, free tier)
1. Create a free account at https://render.com
2. "New +" → "Web Service"
3. Upload this folder (or connect via GitHub)
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment variable: `ANTHROPIC_API_KEY` = your real key
7. Deploy. You'll get a URL like `https://harper-bot-xxxx.onrender.com`

Render gives you HTTPS automatically — this is what makes the microphone work.

## Step 3 — Connect the widget to your server
Open `widget.html`, find:
```
const BACKEND_URL = "https://your-deployed-backend.example.com/api/chat";
```
Replace with your real Render URL + `/api/chat`.

## Step 4 — Add it to the client's website
Paste the entire contents of `widget.html` just before `</body>`.
- **WordPress:** "Custom HTML" block or "Insert Headers and Footers" plugin
- **Shopify:** Online Store → Themes → Edit Code → theme.liquid → before `</body>`
- **Wix / Squarespace:** their "Embed Code" / "Custom Code" element
- **Plain HTML:** paste directly into the file

## Testing the voice features once live
1. Open the deployed site in Chrome (best voice support).
2. Click the chat bubble → "Start conversation."
3. Tap the 🎙️ mic — the browser WILL ask for microphone permission the first time. Accept it.
4. Speak naturally — it transcribes and sends automatically.
5. Harper's replies will be spoken aloud (toggle 🔊 Voice in the header to mute).

## Reusing this for a different client/niche
Everything about Harper's personality lives in `SYSTEM_PROMPT` inside `server.js`.
To reuse for a different business: rewrite that prompt, update the greeting text
in `widget.html`, redeploy.

## Where leads actually go
Right now, leads are logged in the server console when `handoff` becomes true.
For a real client, you'd also want to email the client, send to Slack/WhatsApp,
or save into a Google Sheet — I can build any of these next, just tell me which.
