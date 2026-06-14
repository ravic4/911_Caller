# Safe911 — Setup Guide

## Project structure

```
911_idea/
├── backend/          Node.js API server
│   ├── server.js
│   ├── contacts.csv  ← edit this with real phone numbers
│   ├── .env          ← copy from .env.example, fill in keys
│   └── services/
│       ├── csv.js        parses contacts, builds agent context
│       ├── elevenlabs.js fetches WebRTC tokens
│       └── sms.js        sends silent alerts via Twilio
└── mobile/           React Native (Expo) app
    ├── constants.ts  ← set BACKEND_URL to your server IP
    ├── app/index.tsx main screen
    ├── components/
    │   ├── EmergencyButton.tsx  hold-to-trigger button
    │   └── VoiceAgent.tsx       ElevenLabs agent UI
    └── services/
        ├── alert.ts     sends alerts + fetches agent tokens
        ├── location.ts  gets GPS coordinates
        └── recording.ts starts/stops/uploads audio
```

---

## Step 1 — Backend

### Get your keys
| Service | Where to get it | Env var |
|---------|----------------|---------|
| ElevenLabs | elevenlabs.io → Profile → API Keys | `ELEVENLABS_API_KEY` |
| Twilio | console.twilio.com | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |

```bash
cd backend
cp .env.example .env
# fill in .env with real values
nano .env

# Edit contacts.csv with real emergency contact numbers
nano contacts.csv

npm install
npm start          # runs on :3001
```

### Test the backend
```bash
# Health check
curl http://localhost:3001/health

# Fetch agent token
curl -X POST http://localhost:3001/api/agent/token \
  -H "Content-Type: application/json" \
  -d '{"userProfile":{"name":"Your Name","language":"English"}}'

# Send test alert (will SMS your contacts)
curl -X POST http://localhost:3001/api/alert/silent \
  -H "Content-Type: application/json" \
  -d '{"location":{"lat":40.7128,"lng":-74.0060},"message":"TEST - ignore"}'
```

---

## Step 2 — Mobile app

### Prerequisites
- Node 18+
- Expo CLI: `npm install -g @expo/cli eas-cli`
- Xcode (iOS) or Android Studio

### Run
```bash
cd mobile
npm install

# Edit constants.ts — set BACKEND_URL to your machine's local IP
# e.g. http://192.168.1.42:3001

npx expo run:ios     # or run:android
# Note: NOT expo start — LiveKit WebRTC requires a dev build, not Expo Go
```

---

## Step 3 — iPhone Shortcut (Silent Mode)

1. Open the **Shortcuts** app on iPhone
2. Create a new shortcut:
   - Action: **Get My Location**
   - Action: **Get Contents of URL**
     - URL: `http://YOUR_SERVER_IP:3001/api/alert/silent`
     - Method: POST
     - Headers: `Content-Type: application/json`
     - Body JSON: `{"location":{"lat": [Latitude], "lng": [Longitude]}}`
3. Add to **Back Tap** (Settings → Accessibility → Touch → Back Tap → Double Tap)
   or to the **Action Button** (iPhone 15 Pro+)

This lets you trigger a silent alert without opening the app.

---

## Step 4 — Android shortcut

Use **Tasker** + **AutoShortcut**:
1. Tasker profile: trigger on volume-down long-press (or app shake gesture)
2. Task: HTTP POST to `http://YOUR_SERVER:3001/api/alert/silent` with GPS location

---

## ElevenLabs agent configuration

Your agent ID: `agent_5101kthfh10gex5vkdmdjh6h5b0q`

In the ElevenLabs dashboard, configure your agent's system prompt to include:
> "You are a 911 emergency relay agent. Speak calmly, gather the user's situation and location, translate between the user and emergency operators, and keep the user calm until help arrives."

The backend automatically injects the user's emergency contacts and medical info from `contacts.csv` into each session as a contextual override.

---

## contacts.csv format

```csv
name,phone,relationship,priority
Mom,+15551234567,family,1
Dad,+15559876543,family,2
Best Friend,+15555555555,friend,3
```

- **priority**: 1 = first to be texted
- **phone**: must include country code (+1 for US)
