# kanep.es

Short-link and landing page domain for Kaņepes Kultūras centrs.

## Purpose

- URL shortening for event promotions, ticket links, campaigns
- Event landing pages (e.g. `vasara.kanep.es` for Vasaras Koncerti 2026)
- Domain: `kanep.es` bought on GoDaddy

## Structure

```
kanep.es/
├── index.html          # Root landing page (TBD — generic KKC or campaign)
├── vasara/
│   └── index.html      # Vasaras Koncerti 2026 landing page
├── assets/
│   ├── style.css       # Shared styles (KKC brand)
│   └── logo.svg
├── vercel.json         # Redirects config + Vercel settings
└── CLAUDE.md
```

## URL Conventions

Short links are managed via `vercel.json` `redirects` array. To add a new link:
1. Add entry to `redirects` in `vercel.json`
2. Commit and `vercel --prod`

Example: `kanep.es/pilnais` → lolo.id abonement page

## Hosting

- **Platform:** Vercel (free tier)
- **GitHub org:** Kanepes (org to be created at github.com/organizations/new)
- **Repo:** `kanepes/kanep.es` (private)
- **Deploy:** `vercel --prod` from this directory

## DNS (GoDaddy — to configure when deploying)

Add these records for `kanep.es` in GoDaddy DNS:
- `CNAME vasara` → `cname.vercel-dns.com` (Vasaras Koncerti subdomain)
- `A @` → `76.76.21.21` (Vercel, apex)
- `A @` → `76.76.21.98` (Vercel, apex)

Then add `vasara.kanep.es` as custom domain in Vercel dashboard.

## Vasaras Koncerti 2026

Landing page at `vasara.kanep.es`. Content source: Notion page `36d5c317-1a4a-8108-9336-e78d5c71e18a`.

### Concerts

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
- Abonements "Pilnais" (visi 8): €60
- Abonements "Pusīte" (jebkuri 4 no 8): €30
- Atlaide netiek kombinēta ar abonementu
- Spēkā no 20.06.2026

## Vercel Setup (one-time, when ready to deploy)

```bash
npm i -g vercel
vercel login       # GitHub auth
vercel             # first deploy
vercel --prod      # production
```
