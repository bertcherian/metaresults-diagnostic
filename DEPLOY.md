# Meta Results Diagnostic — Vercel Deployment Guide

## What this does
- Checks your Google Sheet every 30 minutes (Vercel Cron)
- Generates a personalised AI report with Claude for each new entry
- Builds a 5-page branded PDF with booking button
- Emails it to the participant + BCC bert@metaresults.com
- Dashboard at your-app.vercel.app to monitor status + trigger dry runs

---

## Step 1 — Add the logo

Copy your Meta Results logo file into the `public/` folder:

```
public/logo.jpg    ← preferred (JPEG)
   OR
public/logo.png    ← also works
```

---

## Step 2 — Get Gmail credentials (one-time, 10 min)

These are permanent refresh tokens — they never expire.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable **Gmail API**: APIs & Services → Enable APIs → search "Gmail API" → Enable
4. Create OAuth credentials: APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Web application**
   - Authorised redirect URIs: add `https://developers.google.com/oauthplayground`
5. Copy your **Client ID** and **Client Secret**
6. Go to [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
   - Click ⚙️ Settings → tick **"Use your own OAuth credentials"**
   - Enter your Client ID and Client Secret
7. In Step 1, select **Gmail API v1** → tick `https://mail.google.com/`
8. Click **Authorize APIs** → sign in with bert@metaresults.com
9. Click **Exchange authorization code for tokens**
10. Copy the **Refresh token** (starts with `1//`) — this never expires ✓

---

## Step 3 — Push to GitHub

```bash
cd metaresults-app
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/metaresults-diagnostic.git
git push -u origin main
```

---

## Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Add Environment Variables** and add all of these:

| Variable | Value |
|---|---|
| `SHEET_ID` | `1yPSRv3-VKiOqtJjDSN20oMZ28gEiREhrV7vLNLNQcrE` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `GMAIL_CLIENT_ID` | from Step 2 |
| `GMAIL_CLIENT_SECRET` | from Step 2 |
| `GMAIL_REFRESH_TOKEN` | from Step 2 |
| `CRON_SECRET` | any random string e.g. `openssl rand -hex 32` |
| `ADMIN_API_KEY` | any random string e.g. `openssl rand -hex 32` |

5. Click **Deploy**

---

## Step 5 — Verify cron is active

1. Go to Vercel Dashboard → your project → **Cron Jobs** tab
2. You should see `/api/cron` running every 30 minutes ✓
3. On first run it will seed all existing entries (won't re-send old reports)

---

## Step 6 — Run a dry run

Visit `https://your-app.vercel.app` → enter your ADMIN_API_KEY → click **Run Dry Run**

Or via curl:
```bash
curl -X POST https://your-app.vercel.app/api/dry-run \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

Check bert@metaresults.com for the email with PDF attached. ✓

---

## Monitoring

- **Dashboard**: `https://your-app.vercel.app` (requires ADMIN_API_KEY)
- **Status API**: `GET /api/status` (requires x-api-key header)
- **Vercel logs**: Dashboard → your project → Logs → filter by `/api/cron`
- **Cron history**: Dashboard → Cron Jobs → click any job to see run history

---

## Troubleshooting

**Email not sending**: Check Gmail credentials in Vercel env vars. Refresh token must be from bert@metaresults.com account.

**PDF not generating**: Check Vercel function logs. jsPDF runs server-side in the API route.

**Cron not firing**: Cron jobs require a **Pro** Vercel plan. On Hobby plan, trigger manually via `/api/dry-run` or upgrade to Pro ($20/mo).

**Sheet not readable**: Ensure the Google Sheet is set to "Anyone with the link can view".
