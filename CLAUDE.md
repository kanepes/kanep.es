# kanep.es

Short-link and landing page domain for Kaņepes Kultūras centrs.

## Purpose

- URL shortening for event promotions, ticket links, campaigns
- Event landing pages
- Domain: `kanep.es` bought on GoDaddy

## URLs

| Short URL | Destination |
|-----------|------------|
| `kanep.es/vasara` | kanepes.lv/lv/notikumi/vasaras-koncerti-26/ |
| `kanep.es/pass` | lolo.id abonement page |
| `kanep.es/pilnais` | lolo.id abonement page |
| `kanep.es/sofasessions` | kanepes.lv/notikumi/sofa-sessions/ |
| `kanep.es/khans-flesh`  | kanepes.lv/en/notikumi/khans-flesh (EN-only promo) |
| `kanep.es/donations`    | kanepes.lv/atbalsti/ |
| `kanep.es/klara`        | Klara safer-space anonymous report form (Notion) |
| `atbalsti.kanep.es` | kanepes.lv/atbalsti/ (subdomain via Vercel `has` matcher) |

To add a new short link: edit `redirects` in `vercel.json` → `vercel --prod`.

## Project Structure

```
kanep.es/
├── vercel.json         # Redirects + build config
└── CLAUDE.md
```

## Hosting

- **Platform:** Vercel (Hobby plan, free)
- **Vercel team:** kaspu-s-projects (personal account, kasparkondrat)
- **GitHub:** github.com/kanepes/kanep.es (public repo — must be public for Hobby plan auto-deploy)
- **Deploy:** `vercel --prod` from this directory

## DNS (GoDaddy)

Records for `kanep.es`:
- `CNAME www` → `19c961b56229a023.vercel-dns-017.com.`
- `A @` → `216.198.79.1`
- www.kanep.es redirects (308) to kanep.es (set in Vercel dashboard)

## Vercel Deploy

```bash
cd ~/Projects/kanep.es
vercel --prod
```

Build/install commands are empty (redirect-only project, no build needed).

## GitHub Org

- **Org:** github.com/kanepes (created 2026-06-05)
- **Owner:** kasparkondrat GitHub account
- **Repo visibility:** Public (required for Vercel Hobby auto-deploy from org repos)
- Future KKC web projects should go here, not under kasparkondrat personal

## Sofa Sessions

Monthly vinyl listening series at KKC, curated by Jurijs Lapančuks. Free admission.

- **LV page**: `kanepes.lv/notikumi/sofa-sessions/` (WP post ID 2384) — canonical/reference text; EN is a faithful translation of LV (curator credit intentionally dropped from EN to match LV — not a bug if you notice the asymmetry)
- **EN page**: `kanepes.lv/notikumi/sofa-sessions-en/` (WP post ID 2386)
- **Short link**: `kanep.es/sofasessions`
- **YouTube channel**: `youtube.com/@SofaSessions_KKC` — livestreamed also via `mixcloud.com/live/SofaSessions_KKC`
- **Donate button**: styled `#ec7136` (KKC brand orange) background, white text, `'BravoRG'` font (site's display face, same look as `.bookingButton` / "DOD MAN VĒL"), uppercase, no `<strong>` needed — BravoRG reads bold on its own.
  - Links **directly** to EveryPay LinkPay (`https://swedbank.every-pay.eu/lp/eixidnui8j`), bypassing `/atbalsti/` (changed 2026-08-05).
  - **Routing decision**: QR codes printed for the venue point to `/atbalsti/` (full donation menu, all causes). Social posts / `kanep.es/sofasessions` point to the event page itself, whose button skips straight to payment — no extra step, since the event page is already one hop.
- **Video section** (added 2026-08-10): grid of the 6 most recent *distinct-date* episodes (plain `<iframe>` embeds, no JS/API key), replacing the old single-video-with-hidden-playlist embed. Video IDs pulled from the channel's public uploads-playlist RSS (`youtube.com/feeds/videos.xml?playlist_id=UUiolqTKFNqaLsTiqg8Xz8Fw`, no auth needed). Below the grid, a link out to the full channel for the complete archive. Script-based gallery widgets (Elfsight, Smash Balloon) were considered and rejected — see "Editing notikumi content" note below.

## Atbalsti (Donation page)

Donation landing page with two causes: "Biedrībai kopumā" and "Sofa Sessions".

- **URL**: `kanepes.lv/atbalsti/` (WP page ID 2387)
- **Short link**: `kanep.es/donations` → `kanepes.lv/atbalsti/` (LIVE 2026-07-09)
- **Subdomain**: `atbalsti.kanep.es` → `kanepes.lv/atbalsti/`
  - Vercel: domain added, `has`-matcher redirect in vercel.json
  - GoDaddy: needs A record `atbalsti` → `76.76.21.21` (TODO if not done)
- **EveryPay buttons**: LIVE (production credentials active 2026-07-09)
  - Cause 01 (Biedrībai kopumā): `https://swedbank.every-pay.eu/lp/sekfpgc2sf`
  - Cause 02 (Sofa Sessions): `https://swedbank.every-pay.eu/lp/eixidnui8j`
- **Reg. Nr.**: 40008229307

### Polylang translation linking (manual step)
After EN Sofa Sessions post was created (ID 2386), link it to LV ID 2384 via:
WP Admin → Notikumi → sofa-sessions-en → Polylang Language box → set English → link to ID 2384

## Vasaras Koncerti 2026

Landing page at kanepes.lv/lv/notikumi/vasaras-koncerti-26/ (WordPress page).
Lolo widget injected via WordPress theme index.php (see kanepes.lv server section).

### Concerts & lolo.id links

| # | Date | Time | Artist | lolo.id |
|---|------|------|--------|---------|
| 1 | Sat Jun 20 | 20:00 | Nielslens Lielsliens un Vija Moore | https://lolo.id/events/sp-591c08cf-dfe3-468c-948f-32e34250b8d8/ |
| 2 | Thu Jul 2  | 20:00 | Saule Saule | https://lolo.id/events/623c8daf-b731-496a-afdc-9ce838d9b977/ |
| 3 | Fri Jul 10 | 20:00 | Nova Koma | https://lolo.id/events/6466b181-00da-4df4-90de-6c0754124b17/ |
| 4 | Fri Jul 17 | 20:00 | Evija Vēbere + Ivars Arutyunyan | https://lolo.id/events/5ce734ee-40e2-4a35-b8c3-a0dbf191cd63/ |
| 5 | Thu Aug 6  | 19:00 | Advanced Blue + Edgars Rubenis | https://lolo.id/events/bb6a1039-e589-43fb-96c4-d83f5fba9df5/ |
| 6 | Fri Aug 14 | 20:00 | Zvīņas | https://lolo.id/events/f10f29b5-9d35-4a07-bf20-40ab1cc2002e/ |
| 7 | Fri Aug 21 | 20:00 | Bel Tempo | https://lolo.id/events/ed92dd86-a7ee-4692-9e29-12d20452374f/ |
| 8 | Fri Sep 4  | 20:00 | Domenique Dumont | https://lolo.id/events/10e70aa2-76c3-49b4-8ac4-0ec46163f743/ |

Abonements (Pilnais + Pusīte): https://lolo.id/events/2e5c50c7-1abe-4ccb-a721-ede0db6c2b0e/

### Pricing

- Pirmās €10 / Otrās €15 / Trešās €20
- Bērni līdz 12 g.v. — bezmaksas
- 20% atlaide: jaunieši 13–25, studenti, seniori 65+, invalīdi (pavadonis bezmaksas), imigranti
- Abonements "Pilnais" (visi 8): €60 | "Pusīte" (jebkuri 4 no 8): €30
- Spēkā no 20.06.2026

## Klara (Anonymous Safer-Space Reporting)

Anonymous report form for KKC's Klara safer-space protocol. Open to staff and audience — abuse, mistreatment, power abuse, anything else. No login required, no identifying fields required.

- **Short link**: `kanep.es/klara` → `https://kanepes.notion.site/39a5c3171a4a8085b9e5d0a5f84a388e` (LIVE 2026-07-10)
- **Reports land in**: "Klara Reports" Notion teamspace (workspace `kanepes`) — `https://app.notion.com/p/kanepes/Klara-Reports-39a5c3171a4a80fdbcbcdc739b7a32e5`
- **Reviewers**: Jurga (external contact, training co-facilitator) + Kaspars. More to be added by nomination.
- **Why routed through kanep.es**: printed signage/QR stays valid even if the backend form changes later.
- **Project folder**: `~/Projects/klara/` — QR code assets (`klara-qr.png`/`.svg`), policy draft (`klara-report-policy.md`), Jurga onboarding doc (`klara-jurga-onboarding.md`).

## kanepes.lv Server (DO Droplet kkc2021)

**SSH access:** `ssh -i ~/.ssh/kanepes_do root@207.154.242.105`
Key: `~/.ssh/kanepes_do` (ed25519, added 2026-06-05)

**Stack:** Docker on Ubuntu 20.04, Frankfurt (FRA1)

**Containers:**
| Name | Image | Port | Purpose |
|------|-------|------|---------|
| kkc2021 | wordpress | 2021→80 | Main kanepes.lv WordPress |
| kkcold | wordpress | 2016→80 | Old site (legacy) |
| traefik | traefik:latest | 80, 443 | Reverse proxy + SSL |
| kkc2021db | mysql:5.7 | 3306 | Database |
| kkc_phpmyadmin_1 | phpmyadmin | 8081 | DB admin UI |

**Key paths on server:**
- WordPress root: `/var/www/html/` (inside kkc2021 container)
- Theme: `/var/www/html/wp-content/themes/kkc2020react/`
- Theme template: `index.php` (React SPA shell — all routing is client-side React)
- Traefik config: `/var/www/traefik/docker-compose.yml`
- Traefik SSL certs: `/var/www/traefik/letsencrypt/acme.json`
- Docker compose (main): `/var/www/kkc/docker-compose.yml`

**Disk:** 25GB SSD — was 99.9% full 2026-06-05. Fixed by truncating Docker logs.
**Docker log cap:** TODO — add `/etc/docker/daemon.json` with max-size:50m, max-file:3

### WordPress Theme Architecture

The theme (`kkc2020react`) is a React SPA — `index.php` outputs only a shell HTML with `<div id="root">` and React bundles. React fetches all content via GraphQL (WPGraphQL plugin). WordPress `wp_footer` hooks do NOT work for injecting content.

To inject scripts/HTML on specific pages: modify `index.php` directly using PHP `$_SERVER['REQUEST_URI']` check.

### Editing `notikumi` (event) post content

Even though the frontend is a React SPA, each `notikumi` post's body is plain HTML in `post_content`, editable via the standard WP REST API — no need to touch the theme or rebuild anything:

```bash
# Read raw (unrendered) content — needs Application Password auth, edit context
curl -s -u "USERNAME:APP_PASSWORD" "https://kanepes.lv/wp-json/wp/v2/notikumi/{id}?context=edit"

# Write back (send the FULL content field, not a diff)
curl -s -X POST -u "USERNAME:APP_PASSWORD" -H "Content-Type: application/json; charset=utf-8" \
  --data-binary @payload.json "https://kanepes.lv/wp-json/wp/v2/notikumi/{id}"
```

- **Auth**: WP Application Password for user `kaspars.kondratjuks` (wp-admin → Users → profile → Application Passwords). The secret is shown only once at creation — if lost, revoke and create a new one, don't hunt for it in files.
- **Gotcha — quoting**: the button/link markup uses `style="..."` (double-quoted attribute). Any value that itself needs quotes (e.g. `font-family: "BravoRG"`) MUST use single quotes (`font-family: 'BravoRG'`) — double quotes prematurely close the `style` attribute and silently drop everything after them. This bit us once (2026-08-06): font-family/uppercase/font-size vanished from a button, and WP's editor sanitizer stripped the broken remainder on next manual save.
- **Gotcha — link color override**: `.single-content-text .telpasDescrWrap a{color:#ec7136!important}` forces link text to brand-orange inside content areas. If a link needs a different (e.g. white) text color, add `!important` to the inline `color` declaration — inline `!important` wins over the class's `!important` because inline specificity is higher.
- **Why not a no-code widget**: script-tag-based embeds (Elfsight, Smash Balloon, etc.) don't execute when pasted into `post_content`, because React renders it via `dangerouslySetInnerHTML`-style injection and browsers don't run `<script>` tags inserted that way. `<iframe>` tags work fine (no script execution needed). Anything that genuinely needs its own JS to run must go through the `index.php` injection method above (like the lolo widget), not through post content.

### Lolo Widget (Vasaras Koncerti page)

Injected directly into `index.php` before `</body>` with URL check for `vasaras-koncerti`:
- Adds `<div id="lolo-widget">` + lolo script + white-card CSS
- Backup at `index.php.bak`
- LOLO_COMPANY_ID: 4052

To update widget or styling:
```bash
ssh -i ~/.ssh/kanepes_do root@207.154.242.105
docker exec -it kkc2021 bash
vi /var/www/html/wp-content/themes/kkc2020react/index.php
# Rollback: cp index.php.bak index.php
```

### Common Server Commands

```bash
# SSH in
ssh -i ~/.ssh/kanepes_do root@207.154.242.105

# Check disk
docker exec kkc2021 df -h /

# Clear Docker logs (if disk full)
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Restart reverse proxy
cd /var/www/traefik && docker-compose restart

# Fix SSL (if cert corrupted after disk full)
cd /var/www/traefik && docker-compose down && rm letsencrypt/acme.json && touch letsencrypt/acme.json && chmod 600 letsencrypt/acme.json && docker-compose up -d

# Exec into WordPress container
docker exec -it kkc2021 bash
```
