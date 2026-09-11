# Piekļūstamības paziņojums — kanep.es/apmeklejums

Publiskā versija: `kanep.es/apmeklejums/pieklustamiba` (ģenerē no `src/pieklustamiba.html`).

Standarts: WCAG 2.1 AA (LVS EN 301 549), VARAM “Vadlīnijas vienkāršotam piekļūstamības izvērtējumam” — projekta HP darbība “Informācijas pieejamība cilvēkiem ar funkcionālajiem traucējumiem”.

| Aspekts | Risinājums |
|---|---|
| Attēlu alternatīvie teksti | ES emblēma, NAP 2027 un QR kodam ir `alt`; dekoratīvās ikonas `aria-hidden` |
| Struktūra | viens `h1` katrā ekrānā, `fieldset/legend`, lapas `title` |
| Kontrasts | ≥ 4,5:1 abos režīmos; `prefers-contrast: more` pastiprina rāmjus |
| Mērogošana | relatīvas vienības, nav `maximum-scale`, 320 px platumā nav horizontālas ritināšanas |
| Tastatūra | visi elementi ir `button`/`input`; 4 px fokusa rāmis; izlaišanas saite |
| Formas | `legend` etiķetes, kļūda `role="alert"`, fokuss uz pirmo lauku |
| Valoda | `lang` LV/EN, bez krievu valodas (CFLA 01.07.2026) |
| Laiks/kustība | nav laika limitu (kioska atiestate tikai pēc “Paldies”), nav animāciju virs 120 ms |
| Paziņojums | saite “Piekļūstamība” kājenē |

Pārbaude pirms lielas auditorijas: Lighthouse (a11y ≥ 95), axe, tastatūra, ekrānlasītājs, 200 % zoom; VARAM rīks https://pieklustamiba.varam.gov.lv — ziņojumu saglabāt projekta Drive mapē.
