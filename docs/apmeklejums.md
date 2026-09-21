# Apmeklējuma atzīmēšana — rokasgrāmata (kanep.es/apmeklejums)

Projekts Nr. 4.3.2.0/1/25/A/044 “KKC – kopienu kultūras centra attīstība sociālajai saliedētībai”.
Šis dokuments ir tehniskā dokumentācija. **Lietotāju instrukcija koordinācijas komandai un partneriem ir Notion:** lapa „Apmeklētāju uzskaite” zem ERAF projekta lapas (`3e25c317-1a4a-81fd-8b50-fc881c467741`) — tajā ir abas datubāzes, poga partneru instrukcijas nosūtīšanai un apakšlapa „Instrukcija partneriem un pasākumu koordinatoriem” (`3e25c317-1a4a-815b-a269-e0ae47354438`, jāpublicē uz web). Sadaļas 1–5 šeit ir tās avots; ja maini procesu, atjauno abus.

## 1. Kā tas strādā

1. Pie ieejas stāv **viena un tā pati A4 lapa** ar QR kodu (`kanep.es/apmeklejums/print`, izdrukā vienreiz, ielaminē).
2. Apmeklētājs noskenē kodu. Lapa parāda **šodienas pasākumus** no Notion datubāzes “ERAF pasākumi”:
   viens pasākums → to izvēlas automātiski; vairāki → apmeklētājs izvēlas kartīti.
3. Apmeklētājs atzīmē vecuma joslu, grupas (var vairākas vai “Neviens no šiem”), vai dzīvo Latvijā, un nospiež **Iesniegt**.
4. Atbilde nonāk Notion datubāzē “Atbildes (apmeklējums)” kā anonīma rinda, piesaistīta pasākumam.
5. “ERAF pasākumi” katrai rindai automātiski rāda: atbilžu skaitu, Bērni, Jaunieši, Invaliditāte, Imigranti un bēgļi, Latvijā %, Aptvērums %.

Ko skaita:

| Rādītājs | Kā aprēķina |
|---|---|
| Bērni (līdz 17) | vecums “līdz 14” + “15–17” |
| Jaunieši (15–29) | vecums “15–17” + “18–29” (15–17 skaitās abās — tā definēts projekta iesniegumā) |
| Cilvēki ar invaliditāti | atzīmēta poga “Man ir invaliditāte vai funkcionāli traucējumi” |
| Imigranti un bēgļi | atzīmēta poga “Esmu imigrants/-e vai bēglis/-e” |
| Latvijā % | “Dzīvoju Latvijā” ÷ visas atbildes (MK not. 44.p. nosacījums ≥ 85 %) |
| Aptvērums % | atbildes ÷ “Kopējais apmeklētāju skaits” (jāaizpilda ar roku pēc pasākuma) |

**RCR77 (kopējais apmeklētāju skaits)** nāk nevis no QR, bet no lauka “Kopējais apmeklētāju skaits” — biļetes, durvju skaitītājs vai novērtējums. QR dod grupu sadalījumu un aptvērumu, nevis kopskaitu.

## 2. Pirms pasākuma — ievadīt pasākumu Notion (Linda, ~1 min)

Datubāze: **ERAF 4.3.2 | KKC Kopienu centrs → “ERAF pasākumi”**.

Jauna rinda: `Pasākums` (nosaukums, kā redz apmeklētājs), `Datums` **ar laiku**, `Vieta`, `Partneris`, `Darbība`, `Aktīvs` ✓.
`Kods` (EP-1, EP-2 …) rodas automātiski. Bez `Aktīvs` un bez datuma-ar-laiku pasākums lapā neparādās.

Partneri (LJTI, URGA, GPB) sūta savu pasākumu sarakstu Lindai vismaz nedēļu iepriekš, vai ievada paši, ja viņiem ir piekļuve datubāzei.

Ja vienā dienā ir vairāki pasākumi, lapa rāda tos visus — uz A4 lapas rindā “Pasākums:” darbinieks var ar roku uzrakstīt nosaukumu, lai apmeklētājs izvēlas pareizo kartīti.

## 3. Pie durvīm

- A4 lapa redzamā vietā pie ieejas; darbinieks aicina noskenēt (“20 sekundes, anonīmi”).
- **Planšete / kiosks:** atver `Kioska saite` no pasākuma rindas Notion (`kanep.es/apmeklejums?kiosk=1&e=EP-12`). Pasākums ir piesaistīts, valodas slēdzis paslēpts, pēc “Paldies” ekrāns pēc 8 s atgriežas uz sākumu. Der bērniem, cilvēkiem bez telefona, vai ja darbinieks atzīmē mutiski pateikto.
- **“Atzīmēt vēl vienu cilvēku”** uz “Paldies” ekrāna — ģimenei, bērnam, pavadonim no viena telefona.
- **Papīrs (ja nav tīkla):** uz lapas ar svītriņām saskaita pa grupām; pēc pasākuma ievada Notion “Atbildes” rindas ar `Kanāls = papīrs` (viena rinda = viens cilvēks) vai ievada caur kiosku.

## 4. Pēc pasākuma

1. Ierakstīt `Kopējais apmeklētāju skaits` pasākuma rindā.
2. Pārbaudīt `Aptvērums %`. Ja zem ~30 %, nākamreiz aktīvāk aicināt skenēt vai lietot kiosku.
3. Kļūdaini piesaistītu atbildi (nepareizs pasākums) labo “Atbildes” rindā, mainot `Pasākums`.

## 5. Atskaitēm

- Notion → “ERAF pasākumi” → “…” → **Export → CSV** (visas kolonnas). Tas pats “Atbildes” datubāzei, ja vajag rindu līmeni.
- Glabāšana: līdz projekta beigām un 5 gadus pēc noslēguma maksājuma.
- Metode: pašdeklarācija, anonīma, bez personas datiem. CFLA un KM vēl nav noteikuši pierādījumu formātu grupu sadalījumam; šī metode ir projekta paša metode un ir dokumentēta šeit.

## 6. Kā mainīt tekstus un pogas (bez programmētāja)

Visi lapas teksti, jautājumi, atbilžu varianti un saites ir **vienā failā**: `content/config.json` repozitorijā `github.com/kanepes/kanep.es`.

**A. GitHub tīmekļa redaktors (nekas nav jāinstalē)**
1. Atver https://github.com/kanepes/kanep.es/blob/main/content/config.json
2. Spied zīmuli (“Edit this file”).
3. Maini tikai `"lv": "…"`, `"en": "…"` tekstus vai `"enabled": true/false`. **Nemaini `"id"` un `"notion"` vērtības** — uz tām balstās Notion un atskaites.
4. “Commit changes” → “Commit directly to the main branch”.
5. Vercel ~1 minūtes laikā pārbūvē lapu. Ja fails salauzts (piem., pazudis komats), būvēšana **apstājas** un dzīvā lapa paliek vecā — Vercel projektā redzams sarkans “Failed” ar kļūdas rindu latviski.
6. Atgriezt: faila “History” → iepriekšējā versija → “Revert” / pārkopēt saturu.

**B. Claude Code / Cowork** — pasaki, ko mainīt (“nomaini tekstu X uz Y”), sesija labo to pašu failu un iesniedz. Tas pats izvietošanas ceļš.

**C. “Kāpēc mēs jautājam” lapa** dzīvo Notion (`kanep.es/kapec` → Notion publiskā lapa). Labo tieši Notion, nekas nav jāpārpublicē. Kad lapa pārceļas uz kanepes.lv, maina tikai `/kapec` pāradresāciju `vercel.json`.

Ko drīkst darīt konfigurācijā:
- mainīt jebkuru tekstu abās valodās;
- izslēgt/ieslēgt grupu (`enabled`); “imigranti” un “iecelojis” ir divi formulējumi vienai grupai — ieslēdz tikai vienu;
- pievienot jaunu grupu: jauns objekts ar unikālu `id`, `notion` (opcijas nosaukums Notion “Grupas”), `lv`, `en`. Notion opcija rodas automātiski pie pirmās atbildes; lai to redzētu kopsummā, “Atbildes” datubāzē jāpievieno formula `if(prop("Grupas").includes("<notion nosaukums>"), 1, 0)` un “ERAF pasākumi” — rollup `sum` uz to.

Ko nedrīkst: mainīt vecuma joslu `id` (0-14, 15-17, 18-29, 30-64, 65+) — no tām atvasina Bērni/Jaunieši.

## 7. Tehniskā uzbūve (īsi)

- Hostings: Vercel (projekts kanep.es), repo `kanepes/kanep.es` (publisks). Statiskās lapas `public/` (ģenerē `npm run build` no `src/` + `content/config.json`), funkcijas `api/`.
- Datu krātuve: Notion caur adapteri `lib/store/notion.js`. Vides mainīgie Vercel: `NOTION_TOKEN`, `NOTION_EVENTS_DB`, `NOTION_RESPONSES_DB`, `STORE=notion`. Nākotnē citu krātuvi pievieno kā jaunu adapteri `lib/store/`.
- Nesaglabā: vārdu, IP, ierīces datus, sīkdatnes. Laiks — līdz minūtei.
- Ja Notion nav pieejams: telefons atbildi patur un nosūta nākamreiz, kad lapu atver; kļūdu tekstu redz apmeklētājs.
- Lokāla pārbaude: `STORE=mock MOCK_EVENTS=2 node scripts/dev-server.js` → http://localhost:3000/apmeklejums
- Piekļūstamība: WCAG 2.1 AA; paziņojums `kanep.es/apmeklejums/pieklustamiba`. Pirms lielas auditorijas izlaist cauri https://pieklustamiba.varam.gov.lv un ziņojumu saglabāt projekta mapē.

## 8. Vercel iestatīšana (vienreiz, Kaspars)

1. Notion → Settings → Connections → Develop or manage integrations → **New internal integration** “kanep.es apmeklejums”, tiesības: read + insert content. Nokopē “Internal Integration Secret”.
2. Notion: atver “ERAF pasākumi” un “Atbildes (apmeklējums)” → “…” → Connections → pievieno integrāciju abām.
3. Vercel → projekts kanep.es → Settings → Environment Variables:
   - `NOTION_TOKEN` = integrācijas noslēpums
   - `NOTION_EVENTS_DB` = `9a76a854-1668-4b17-84ae-0406272d84b6`
   - `NOTION_RESPONSES_DB` = `bfe8ddb4-2cc5-43bf-8ec1-912de903d1ea`
   - `STORE` = `notion`
4. Notion: lapu “Kāpēc mēs jautājam, kas tu esi?” → Share → Publish (publiska). Pārbaudīt, ka `kanep.es/kapec` to atver.
5. `vercel --prod` vai vienkārši `git push` (auto-deploy). Pārbaudīt: `kanep.es/apmeklejums`, `kanep.es/apmeklejums/print`, `kanep.es/CLAUDE.md` (jābūt 404), `kanep.es/vasara` (jāpāradresē).
