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
