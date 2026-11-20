# React-Lib

Gemeinsame React-Komponenten, Design-Tokens und Sass-Mixins für KTE-Programme (React 19, Sass). Die Apps verwenden ihre eigene React-Installation. Alle Stile sind SCSS; `dist` enthält zusätzlich das gebaute CSS.

## Installieren

Im Frontend-Verzeichnis ausführen. Das Repo ist öffentlich.

```powershell
pnpm add "github:Neyu703/React-Lib#v0.5.0-rc.2"
```

```tsx
import { Segmented } from '@neyu703/react-lib'
import '@neyu703/react-lib/styles.css'

<Segmented
  id="live"
  label="Live-Ansicht"
  value={value}
  options={[["inherit", "Erben (An)"], ["on", "An"], ["off", "Aus"]]}
  onPick={setValue}
/>
```

Die gemeinsame Segment-Auswahl unterstützt bis zu acht Optionen. Die optionale dritte Angabe ist ein Tooltip. Überschreibt eine App `--segmented-track`, `--segmented-thumb`, `--segmented-muted`, `--segmented-selected` oder `--segmented-focus`, verwendet die Komponente ihr Farbschema. Mit `--segmented-border`, `--segmented-thumb-border`, `--segmented-shadow`, `--segmented-padding` und `--segmented-font-size` lassen sich Umrandung, Schatten und Abstände anpassen.

## Komponenten

`Segmented`, `IconButton` (+ Icons), `InfoTip`, `WizardSteps`, `Float`, `Skeleton`/`SkeletonLines`/`SkeletonGrid`/`Loading`/`Ghost`, `SearchField`, `DateField`, `WeekField`, `CalendarPopover`, `TimeField`/`Wheel`, `PreviewSelect` sowie die Datumshelfer (`addDays`, `mondayOf`, `isoWeekOf`, …). Die Stile in `scss/styles` nutzen die Tokens von `scss/base` (`--tint`, `--on-tint`, `--label`, `--separator`, `--bg-card`, `--fill`, `--red`, `--shadow-card` …); eine App ohne `scss/base` definiert diese Tokens als Aliase auf ihre eigenen.

### Dialoge (react-redux)

Die Dialog-Bausteine liegen als Module in `src/modules/<name>/` und lesen/schreiben nur über react-redux (`@reduxjs/toolkit` und `react-redux` sind Peer-Abhängigkeiten); es gibt weder Context noch Props-Ketten. Die Lib importiert nichts aus dem App-Code.

| Modul | Komponenten | Slice (`reducerKey`) |
| --- | --- | --- |
| `dialogs` | `Modal`, `DialogFrame`, `saveDialogBox`, `blockNativeContextMenu` | `dialogs` |
| `portalTheme` | – (`applyPortalTheme`) | `portalTheme` |
| `jobs` | `JobProgress` | `jobs` |
| `colorField` | `ColorField` | `colorField` |
| `updater` | `UpdateDialog`, `ChangelogDialog` | keiner |
| `confirm` | `ConfirmView` | keiner |

**Form eines Moduls** (`index.ts`): ein Objekt `<name>Module = { reducerKey, reducer, components }` (bei Modulen ohne State nur `components`), dazu die Komponenten, Actions und Typen als benannte Exporte. Module greifen nur über das `index.ts` eines anderen Moduls aufeinander zu (Test `moduleBoundaries.test.ts`). Gemeinsames ohne Modul-Charakter liegt in `src/core/`: `configureReactLib`/`reactLibHandlers`, `useReactLibSelector`/`useReactLibDispatch`/`useReactLibStore`/`selectReactLib`, `REACT_LIB_STATE_KEY`, `createReactLibReducers`. Alles bleibt wie bisher aus dem Paket-Einstieg importierbar.

**Store.** Eine Zeile genügt: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }`. `reactLibReducer = createReactLibReducers()` enthält alle Module; `createReactLibReducers([dialogsModule, colorFieldModule])` baut nur die gewählten (die Komponenten anderer Module brauchen dann ihren Slice trotzdem). `ReactLibState` ist der Typ des Default-States. Die App füttert die Slices per Action: `portalThemeSet`, `dialogLimitSet`, `dialogBoxesLoaded`/`dialogBoxesReset`, `jobViewSet`/`jobViewCleared`/`jobAutoCloseSet`, `customColorsSet`. Was die Lib nach außen meldet (Dialogposition speichern, eigene Farben laden/speichern, Update starten, Tab öffnen, Auto-Schließen merken), kommt über `configureReactLib({ … })` einmal beim Start; Endpunkte kennt die Lib nicht.

**Typ-Verträge für die Python-REST-API** (je `src/modules/<name>/types.ts`, aus dem Einstieg exportiert): `DialogBox`/`DialogBoxes` (Dialogposition), `PortalThemeState`, `JobSnapshot`/`JobStep`/`JobEvent`/`JobView` (Job-Status), `CustomColorsResponse` (`string[]`), `UpdateStatus`/`UpdateInfo`, `ChangelogData`/`ChangelogEntry`, `ConfirmViewProps`. Die Kommentare dort nennen, welcher Handler sie transportiert.

### Testing (`@neyu703/react-lib/testing`)

Hilfen für App-Tests (vitest/jest + jsdom); `@testing-library/react` ist eine optionale Peer-Abhängigkeit, vitest wird nicht vorausgesetzt.

- `createTestStore(preloaded?, extraReducers?)`: Store mit `reactLibReducer` unter `REACT_LIB_STATE_KEY`, optional App-Reducer und vorbelegter Root-State.
- `renderWithLibStore(ui, store?)`: `Provider` + `render`, liefert `{ store, … }`; `libState(store)` liest den Lib-State.
- `installDomStubs()`: jsdom kennt `HTMLDialogElement.show/showModal/close` und Pointer-Capture nicht; einmal im Setup aufrufen.
- `resetReactLib()`: setzt die Handler (`configureReactLib({})`) zurück; nach jedem Test aufrufen.

### Anmeldung (`auth`)

Gegenstück zu `entra_auth.install_auth` (`/api/auth/*`): `LoginGate`, `useAuth` und der Slice `auth`, gelesen über Redux, ohne Context und ohne Props-Kette.

```tsx
configureReactLib({ authApi: createAuthApi({ headers: () => ({ "X-Token": token() }) }) }) // optional, Standard: /api/auth
<LoginGate title="Dienstplan"><App /></LoginGate>
const { user, signOut } = useAuth()
```

## Stile

Quelle ist immer SCSS in `scss/`. Sass-Apps laden die Quellen, Apps ohne Sass-Build das gebaute CSS.

```scss
@use "@neyu703/react-lib/scss/base";            // Tokens, Reset, .container
@use "@neyu703/react-lib/scss/styles";          // Komponentenstile
@use "@neyu703/react-lib/scss/mixins" as *;     // Text-Mixins, card, grouped-list, filled-button, ...
```

```ts
import "@neyu703/react-lib/base.css";   // gebautes CSS ohne Sass
import "@neyu703/react-lib/styles.css";
```

Eine Seite nur mit dem Suchfeld nutzt `dist/search-field.css` (`@neyu703/react-lib/search-field.css`). Statische Seiten ohne Build kopieren `node_modules/@neyu703/react-lib/dist/base.css` neben ihre `index.html` (Beispiel: `coords-checklist`, Skript `sync:react-lib`).

### Fenstergrößen

| Klasse | Breite | Geräte | `--gutter` | `--content-width` |
|---|---|---|---|---|
| compact | < 600px | iPhone 14 Plus, Galaxy A56 | 16px | 100% |
| medium | 600–839px | Galaxy Tab S10 FE / FE+ Hochformat | 24px | 640px |
| expanded | 840–1199px | Tablets quer | 32px | 760px |
| large | ≥ 1200px | Desktop | 32px | 880px |

Maus/Trackpad (`hover: hover` + `pointer: fine`) senkt `--tap-target` von 44px auf 36px.

### Tokens

Farben (hell/dunkel per `prefers-color-scheme`), `--radius-*`, `--tap-target`, `--safe-*`, `--gutter`, `--content-width` und die Schriftskala `--text-*` (`font: var(--text-body)`). Die Mixins setzen `scss/base` voraus; die Komponentenstile haben eigene Fallbacks.

## Entwickeln und versionieren

```powershell
pnpm install --frozen-lockfile
pnpm build   # tsc + sass nach dist
```

Das Paket liefert JavaScript und TypeScript-Deklarationen sowie das aus `scss/` gebaute CSS (`dist/base.css`, `dist/styles.css`). `dist` gehört zu jedem Release-Commit, damit der Git-Tag direkt installiert werden kann. Vor einem neuen Tag Paketversion erhöhen, bauen und den Paketinhalt mit `pnpm pack` prüfen.
