# Restructure

Restructure is een rustige web app voor mentale organisatie, brain dumps, planning en persoonlijke geheugensteuntjes.

De app draait om:

- mentale rust
- gedachten structureren
- planning zonder stress
- focus en overzicht
- spullen onthouden en terugvinden

## Huidige status

De app is een statische web/PWA zonder framework. De interface gebruikt gewone HTML, CSS en JavaScript modules in de map `scripts`.

Belangrijkste pagina's:

- Brain Dump: gedachten snel invoeren.
- Overzicht: tijdelijk leeggezet voor een nieuw ontwerp.
- AI Planner: tijdelijk leeggezet voor een nieuw ontwerp.
- Agenda: nieuwe desktop/web agenda is actief; mobiele agenda heeft een aparte mobiele flow.
- Mijn spullen: tijdelijk leeggezet voor een nieuw ontwerp.
- Help & Uitleg: rustige uitlegomgeving voor nieuwe gebruikers.
- Instellingen: thema, taal, reminders, agenda- en app-instellingen.

## Belangrijkste bestanden

- `index.html`: hoofdstructuur van de app.
- `styles.css`: volledige styling, inclusief desktop en mobiele layouts.
- `app.js`: bootstrap van de app.
- `scripts/state.js`: centrale AppState.
- `scripts/storage.js`: localStorage keys en opslaghelpers.
- `scripts/agenda.js`: agenda rendering, events bouwen en agenda controllers.
- `scripts/events.js`: event binding per pagina.
- `scripts/brain-analysis.js`: Brain Dump analyse en ordening.
- `scripts/remember.js`: Mijn spullen / geheugen logica.
- `scripts/settings.js`: instellingen renderen en toepassen.
- `scripts/i18n.js`: vertalingen voor Nederlands en Engels.
- `scripts/pwa.js`: PWA en push test-flow.
- `service-worker.js`: offline/PWA en push events.
- `manifest.json`: PWA manifest en app icons.
- `api/`: tijdelijke push API endpoints.
- `assets/`: logo, iconen en PWA assets.

## Data opslag

Data wordt lokaal opgeslagen in `localStorage` via `scripts/storage.js`.

Belangrijke data:

- `appointments`
- `dayItems`
- `rememberItems`
- `memoryNotes`
- `settings`
- `brainEntries`

De data wordt niet automatisch gewist bij UI redesigns.

## Agenda status

De desktop/web Agenda is opnieuw opgebouwd als echte kalender.

Huidig gedrag:

- Desktop Agenda toont alleen echte opgeslagen agenda-items.
- Items uit `appointments` en `dayItems` zijn zichtbaar en verwijderbaar.
- Afgeleide Brain Dump-items, feestdagen en vakanties worden niet meer als normale verwijderbare agenda-items getoond.
- Filters voor School, Werk, Sport en Vrije tijd werken alleen op zichtbaarheid en verwijderen geen data.
- Dag, Week, Maand en Lijst delen dezelfde gefilterde eventlijst.

Waarom:

De Agenda moet voelen als tijd, dagen en afspraken. Niet als dashboard of AI-overzicht.

## PWA status

De app heeft PWA support:

- manifest
- app icons
- apple touch icon
- service worker
- iPhone homescreen support

Push notificaties zijn voorbereid als technische test, maar echte reminderlogica voor agenda/spullen is nog niet volledig gebouwd.

## GitHub status

Op deze computer zijn `git` en `gh` op dit moment niet beschikbaar in PATH. Daardoor kan Codex nu wel lokale bestanden bijwerken, maar niet zelf committen, pushen of pull requests maken.

Deze lokale projectmap is voorlopig de bron van waarheid:

`C:\Users\Admin\Documents\Codex\2026-05-14\maak-een-rustige-minimalistische-web-app`

## Volgende logische stappen

1. Nieuw Overzicht ontwerpen.
2. Nieuwe AI Planner ontwerpen.
3. Nieuwe Mijn spullen interface ontwerpen.
4. Agenda verder verfijnen na gebruikstest.
5. Git/GitHub koppeling regelen zodat wijzigingen ook direct naar GitHub kunnen.
