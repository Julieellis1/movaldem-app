# Movaldem Church App

Standalone Android app for **Mountain of Victory at the Last Day Evangelical Ministry (Movaldem)**.
It shares the **same database as the church website** — members, programs, events, gallery and quiz
all come from the WordPress backend via its REST API. No second database, no duplicated content.

UI is built from the `stitch_church_mobile_app_ui` template (vellum / cathedral evergreen / altar gold,
EB Garamond + Plus Jakarta Sans, Material Symbols — the icon font is self-hosted so it works offline).

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Account creation & login | ✅ UI + mock auth; live mode uses WP Application Passwords, registration via `movaldem/v1/register` (to add) |
| 2 | Church Programs page | ✅ UI + mock data; live: `GET /wp/v2/program` |
| 3 | Church Events page | ✅ UI + mock data; live: `GET /wp/v2/event` |
| 4 | Instant notification alerts | ✅ UI + FCM scaffold; needs Firebase project + `movaldem/v1/devices` sender (to add) |
| 5 | Bible quiz (full UX: lobby → timed play → results) | ✅ UI + mock questions; live: `movaldem/v1/quiz/*` (to add) |
| 6 | Quiz leaderboard | ✅ UI + mock board; live: `movaldem/v1/quiz/leaderboard` (to add) |
| 7 | Zeno online radio (app + website homepage) | ✅ Player UI + persistent mini-player; needs the church's Zeno.FM stream URL |
| 8 | Gallery (photos + sermon clips) | ✅ UI + mock albums; live: `GET /wp/v2/gallery_album` |

The app runs in **demo mode** (`USE_MOCK: true` in `app/js/config.js`) until the backend
endpoints are live — every screen works standalone right now.

## Project layout

```
movaldem-app/
  app/                  # the actual app (Capacitor webDir)
    index.html          # SPA shell: screen container, mini-player, tab bar
    css/app.css         # design system (self-hosted Material Symbols)
    js/config.js        # API base URL, Zeno stream URL, feature flags
    js/api.js           # data layer — mock data + WordPress REST client
    js/screens.js       # all screens (auth, home, events, quiz, gallery, profile…)
    js/app.js           # router, Zeno player, quiz engine, push scaffold
    assets/             # logo.png, material-symbols.woff2
  template/             # the uploaded Stitch UI template (reference only)
  tools/shoot.py        # CDP screenshot helper
  shots/                # screen captures
  android/              # Capacitor Android platform (app id: org.movaldem.app)
  .github/workflows/build-apk.yml   # debug APK on push / manual dispatch
```

## Preview locally

Open `app/index.html` in a browser (or serve the `app/` dir). Add `?preview=1`
to skip the login screen with a demo session.

## Build the APK

1. Create a GitHub repo (e.g. `Julieellis1/movaldem-app`) and push this folder as the repo root.
2. If the token can't push `.github/workflows/`, add `build-apk.yml` via the GitHub web UI.
3. Run the **Build Movaldem debug APK** workflow (manual dispatch or push to `main`).
4. Download `movaldem-debug-apk` from the run's artifacts. (Needs Node 22 + Java 21 — already set.)

## Going live — checklist

### A. WordPress backend (movaldem-core plugin additions)
- [ ] Expose CPTs to REST: `show_in_rest => true` on `program`, `event`, `gallery_album`
- [ ] `POST /wp-json/movaldem/v1/register` — public registration (name, email, password)
- [ ] `GET /wp-json/movaldem/v1/quiz/today` — daily quest (uses existing `wp_mv_questions`)
- [ ] `POST /wp-json/movaldem/v1/quiz/submit` — record attempt, return XP/streak
- [ ] `GET /wp-json/movaldem/v1/quiz/leaderboard` — weekly XP ranking
- [ ] `GET /wp-json/movaldem/v1/quiz/categories`
- [ ] `POST /wp-json/movaldem/v1/devices` — store FCM tokens per user
- [ ] Push sender: on new announcement publish → Firebase Cloud Messaging (HTTP v1) to stored tokens
- [ ] Then set `USE_MOCK: false` and `WP_BASE` to the production site in `app/js/config.js`

### B. Zeno.FM radio
- [ ] Church creates a free broadcaster account at [zeno.fm](https://zeno.fm) → creates the
      "Movaldem Radio" station → copies the **stream URL** (`https://stream.zeno.fm/xxxx`)
- [ ] Paste it as `ZENO_STREAM_URL` in `app/js/config.js` (app player goes live)
- [ ] Website homepage: embed the same stream URL in a radio player block on the homepage

### C. Firebase push (instant alerts)
- [ ] Create a Firebase project → add an Android app (`org.movaldem.app`) → download
      `google-services.json` into `android/app/`
- [ ] Set `PUSH_ENABLED: true` in `app/js/config.js`
- [ ] Add the Firebase service-account key to the WP push sender (A, last item)

### D. Release
- [ ] Production signing key + `signingConfigs` (debug APK is unsigned, fine for testing)
- [ ] Point `WP_BASE` at `https://www.movaldem.org` after the domain cutover
