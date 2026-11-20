# Architektur: modulare Apps mit React-Lib

Stand: 2026-11-20, Branch `react-lib-refactor` (Lib `v0.5.0-rc.4`). Dieses Dokument hält die Entscheidungen fest, damit sie nicht jedes Mal neu besprochen werden.

## Ziel

Jedes Python-Programm hat dieselbe Struktur: **React + Redux Toolkit + TypeScript** im `frontend/` und eine **Python-REST-API (FastAPI)**. Wiederverwendbare Teile werden als **Module** gebaut, die man einbaut, und dann läuft es. Regeln für alles:

- Zustand liegt in **react-redux**. Kein Prop-Drilling, **kein React-Context**. Eingabefelder (`DateField`, `TimeField`, `SearchField` …) behalten `value`/`onChange`, das ist der Standardvertrag eines Feldes und kein Drilling.
- Stile sind **immer SCSS**, nie handgeschriebenes CSS (gebautes CSS aus `dist/` ist erlaubt, wenn eine Seite keinen Sass-Build hat).
- Die Lib ist **zu 100 % getestet** (Statements, Branches, Functions, Lines). Apps testen Lib-Komponenten nicht noch einmal und mocken keine Lib-Interna; sie nutzen `@neyu703/react-lib/testing`.
- Python: `mypy --strict` und `pyright strict` sauber, FastAPI als einzige REST-Basis.

## Aufbau der Lib

```
src/
  *.tsx                 einfache Komponenten ohne Zustand (Segmented, IconButton, Button, StatusPill, Select, SearchField, DateField …)
  core/                 REACT_LIB_STATE_KEY, reactLibReducer, createReactLibReducers, configureReactLib, Hooks
  modules/<name>/       dialogs, portalTheme, jobs, colorField, auth, updater, confirm, tabs
    index.ts            exportiert <name>Module = { reducerKey?, reducer?, components }, Komponenten, Typen
    types.ts            REST-Verträge (das Python-Gegenstück spiegelt sie 1:1)
    slice.ts            Redux-Slice (falls das Modul Zustand hat)
  testing/              createTestStore, renderWithLibStore, libState, fakeAuthApi, installDomStubs, resetReactLib
scss/                   _tokens, _reset, base.scss, styles.scss (alle Komponentenstile), auth-gate.scss, search-field-page.scss, _mixins
dist/                   gebautes JS/d.ts/CSS, gehört zu jedem Release-Commit (Git-Tag wird direkt installiert)
```

Modulgrenzen: Module importieren sich nicht gegenseitig außer über `index.ts` (Test `moduleBoundaries.test.ts` prüft das). `core` kennt Module nur über deren `index.ts` (nur Typen).

## Eine App anbinden (Checkliste)

1. `pnpm add github:Neyu703/React-Lib#<Tag>` (Tags: `v0.4.0` stabil, `v0.5.0-rc.N` Vorabversion). Optional `pnpm add @reduxjs/toolkit react-redux` (Peers).
2. Store: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }` zu den eigenen Reducern. Ein Store für die ganze App, auch für das Anmelde-Gate.
3. SCSS: `@use "@neyu703/react-lib/scss/base";` (Tokens, Reset) und `@use "@neyu703/react-lib/scss/styles";` vor den App-Stilen. Eine App mit eigener Palette definiert die Lib-Tokens als **Aliase** auf ihre Variablen: `--tint`, `--on-tint`, `--label`, `--label-secondary`, `--separator`, `--bg-card`, `--fill`, `--fill-hover`, `--red`, `--shadow-card` (Beispiel: `Dienstplan/frontend/src/styles/_tokens.scss`).
4. `configureReactLib({ ... })` **einmal mit allen Handlern** aufrufen: der Aufruf ersetzt alle Handler. Muss das Anmelde-Gate vorher laufen, wird `authApi` im frühen und im späteren Aufruf mitgegeben (Beispiel: `Dienstplan/frontend/src/lib/reactLibHost.ts`).
5. Anmeldung: `<Provider store><LoginGate title="…"><App/></LoginGate></Provider>`. Alles, was die API anspricht, lädt erst hinter dem Gate (Beispiel: `Dienstplan/frontend/src/main.tsx`).
6. Tests: `createTestStore`/`renderWithLibStore`, `fakeAuthApi()`, `installDomStubs()` und `resetReactLib()` aus `@neyu703/react-lib/testing`.

## Python-Gegenstücke (Misc/Packages, privat)

Gleicher Modulname auf beiden Seiten, Router mit `install_*(app)`. Ziel-Zuordnung:

| Modul (Lib) | Python-Paket | Stand |
|---|---|---|
| `auth` | `entra_auth` (`install_auth`, `/api/auth/*`) | fertig; `entra_auth/frontend` ist entfernt, die Lib liefert das Frontend |
| `jobs` | `job_progress` (`install_jobs`, `GET /api/job?since=`) | fertig, Dienstplan nutzt es |
| `updater` | `auto_updater` (`install_update`, `/api/update`, `/api/update/start`) | fertig, Dienstplan nutzt es |
| `dialogs`, `portalTheme`, `colorField`, `confirm` | nur Frontend (die App speichert Dialogpositionen/Farben über `configureReactLib`-Handler) | fertig |

REST-Basis ist **FastAPI überall**. Umgestellt: Dienstplan, Schichtplan (schon FastAPI), ConfigEditor, StoreRename (`store_rename/webserver/`), EXEBuilder (bereits FastAPI-artig).

## Release und Branches

- Der gesamte Umbau läuft auf dem Branch **`react-lib-refactor`** in allen betroffenen Repos. Auf `main` liegt der Stand vor dem Umbau (die Lib-Tags bis `v0.4.0` und die gepushten Lib-Commits auf `main` sind bewusst nicht zurückgenommen, die alten Apps pinnen `v0.1.0`).
- Lib-Release: Version in `package.json`, `pnpm build`, `pnpm test` (100 %), Commit inkl. `dist`, Tag `vX.Y.Z`, Push von Branch und Tag. Apps pinnen den Tag (`github:Neyu703/React-Lib#v0.5.0-rc.4`), nie einen lokalen `file:`-Link.
- Vor dem Merge nach `main`: alle Apps im Browser prüfen (bisher nur über Tests abgesichert), Lib als `v0.5.0` taggen und die Pins von `-rc.N` auf `0.5.0` stellen.

## Stand der Repos (react-lib-refactor)

| Repo | Inhalt |
|---|---|
| React-Lib | Module + einfache Komponenten, 436 Tests, 100 % |
| Dienstplan | Komponenten, Dialoge, Anmeldung aus der Lib; Backend nutzt `job_progress`/`install_update` aus Packages |
| Schichtplan | Redux-Store, `LoginGate` aus der Lib, SCSS |
| ConfigEditor | FastAPI-Backend, Redux-Store, SCSS, `SearchField`, 100 % |
| EXEBuilder | Lib-`Skeleton`, Token-Aliase, Frontend-Tests 100 % |
| StoreRename | FastAPI-Backend (`webserver/`), Host-/Origin-Prüfung gegen DNS-Rebinding; React-Frontend in Arbeit (Plan: `docs/react-migration-plan.md`) |
| Misc/Packages | `job_progress`, `install_update` fertig; `entra_auth/frontend` entfernt |
| StrongCSVVisualizer, coords-checklist, WebDeployment | `main` auf Vorumbau-Stand zurückgesetzt (Revert); `base-css` ist archiviert, die Lib enthält Tokens, Reset und Mixins |

## Bekannte Lücken und offene Punkte

- Kein Browser-Lauf: Aussehen der Felder, Dialoge, Anmeldung gegen Entra, Jobfortschritt, Farbpalette sind nur über Tests abgesichert. Die Lib-Stile laden jetzt vor den App-Stilen und können die Kaskade verändern.
- Lib fehlt noch: eine Navigations-Komponente (`SideNav` bleibt im Dienstplan). Die Basis setzt eine globale Body-Schrift, die Apps überschreiben müssen. Neu in `rc.4` (`IconButton` mit Text, `SearchField`-Platzhalter, `Button`, `StatusPill`, `Select`, Modul `tabs`) sind nur über Tests abgesichert.
- `Card` (Collapsible) und `SideNav` bleiben im Dienstplan, weil ihre Stile am Plan-Layout hängen.
- StoreRename-Frontend (React/Redux) wird gebaut (Plan im Repo). EXEBuilder ist FastAPI, nutzt aber eigene SSE-Streams (`/api/events`, `/api/stream`) statt `install_jobs`/`install_update`; eine Angleichung ist offen.
- `Dienstplan`: `RhythmWizard`-Test „without showProblems …" ist unter Last unzuverlässig (läuft allein oder als Datei grün), unabhängig vom Umbau.
- Commits der Agenten sind teils von Hand statt mit `smart-commit` entstanden (Agenten können den Skill nicht aufrufen).
