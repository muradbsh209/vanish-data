# VanishData — Ephemeral Encrypted File Sharing (MVP)

This is a hackathon-ready Next.js (App Router) prototype for VanishData.

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

Notes:
- The client encrypts files using `crypto-js` AES before uploading. The secret key is put in the URL fragment (`#key=...`) so it's never sent to the server.
- The backend is an in-memory store at `app/api/files/route.ts` for demo purposes.
- Viewer implements anti-screenshot (blur on window blur), selective reveal around mouse, watermark with IP+timestamp, and a "Burn" action that deletes the file.

Plans & Pricing
----------------

🟢 Free Plan (Growth üçün) — pulsuz
• 1:1 mesajlaşma
• 24 saatlıq auto-delete
• limitli fayl ölçüsü
• basic encryption
👉 Məqsəd: istifadəçi bazası yaratmaq

🔵 Pro Plan (Kiçik komandalar) — $8 / istifadəçi / ay
• vaxtı sərbəst seçmək
• 5 GB fayl limiti
• one-time access
• basic audit log
• 2FA
👉 10 nəfərlik komanda = $80/ay

🟣 Business Plan — $12 / istifadəçi / ay
• limitsiz vaxt seçimi
• geniş audit sistemi
• admin panel
• rol əsaslı icazə
• 20 GB fayl
• prioritet dəstək
👉 100 nəfərlik şirkət = $1,200/ay

🔴 Enterprise Plan — $18–25 / istifadəçi / ay və ya illik müqavilə
• Dedicated server
• On-premise quraşdırma
• Compliance (GDPR-ready)
• Security audit
• Custom integration
• SLA müqaviləsi
👉 1000 nəfərlik şirkət = $18,000–25,000/ay

This repository includes a demo role- and plan-aware authentication system under `app/api/auth` and client helpers in `components/AuthProvider.tsx`.

Expose to public (sharing links)
-------------------------------

If you want links that open from other devices (not localhost), set a public base URL and restart the dev server.

1) Create `.env.local` at the repo root and add:

```env
NEXT_PUBLIC_BASE_URL=https://your-public-url.example
```

2) Restart the dev server (`npm run dev`). The app uses `NEXT_PUBLIC_BASE_URL` when building share links; otherwise it falls back to the current origin.

Quick ways to get a public URL for local development:

- ngrok:

```bash
npm install -g ngrok
ngrok http 3000
# copy the https://... URL and put it into NEXT_PUBLIC_BASE_URL
```

- localtunnel:

```bash
npm install -g localtunnel
lt --port 3000 --subdomain yoursub
```

- Cloudflare Tunnel (cloudflared):

```bash
cloudflared tunnel --url http://localhost:3000
```

Or deploy to Vercel / Netlify / Render for a permanent public URL and set `NEXT_PUBLIC_BASE_URL` to the deployed domain.

Security note: Keep the encryption key in the URL fragment (`#key=...`) as before — fragments are never sent to the server. For production, use HTTPS and short-lived signed links.
