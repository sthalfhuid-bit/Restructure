# Changelog

## 2026-05-17

### Huidige stand vastgelegd

- Projectdocumentatie toegevoegd met de huidige structuur, status en belangrijke bestanden.
- Lokale projectmap vastgelegd als bron van waarheid zolang Git/GitHub CLI nog niet beschikbaar is.

### Agenda

- Desktop/web Agenda is omgezet naar een kalendergerichte ervaring.
- Grote dashboardblokken, dubbele formulieren en AI-achtige agenda-content zijn verwijderd of losgekoppeld.
- Desktop Agenda heeft Dag, Week, Maand en Lijst views.
- Toevoegen loopt via een compacte desktop modal.
- Filters voor School, Werk, Sport en Vrije tijd werken nu op alle desktop agenda views.
- Maandweergave toont compacte items met delete-acties voor echte opgeslagen items.
- Desktop Agenda toont nu alleen echte, beheerbare agenda-items uit `appointments` en `dayItems`.
- Afgeleide Brain Dump-items worden niet meer als normale verwijderbare agenda-items getoond.
- Feestdagen en schoolvakanties zijn terug als vaste, subtiele kalenderitems zonder verwijderknop.
- Mobiele Agenda is herwerkt naar een enkele rustige timeline met sticky topbar, sticky weekbalk, uitklapbare maandkalender en mobiele add-event sheet.
- Mobiele Agenda-header en weekbalk compacter/platter gemaakt en scroll-sync rustiger gemaakt.
- PWA-cache vernieuwd zodat iPhone/Vercel updates sneller worden opgepakt.

### Pagina's tijdelijk leeggemaakt voor nieuw ontwerp

- Overzicht is tijdelijk vervangen door een placeholder.
- AI Planner is tijdelijk vervangen door een placeholder.
- Mijn spullen is tijdelijk vervangen door een placeholder.

### PWA en branding

- Restructure gebruikt het teal/neon app-icoon in de web app en PWA assets.
- PWA metadata, manifest en iPhone homescreen ondersteuning zijn aanwezig.
- Push notificatie-testflow is voorbereid, zonder volledige reminderlogica.

### Architectuur

- App is opgesplitst in duidelijke scripts voor state, storage, agenda, events, settings, i18n, remember en helpers.
- `AppState` bevat centrale state en subscriptions.
- localStorage toegang loopt via `scripts/storage.js`.

### Open punten

- Git en GitHub CLI zijn niet beschikbaar in deze omgeving.
- Echte GitHub commits/pushes kunnen pas zodra Git of een GitHub connector beschikbaar is.
- Nieuw ontwerp voor Overzicht, AI Planner en Mijn spullen moet nog gebouwd worden.
