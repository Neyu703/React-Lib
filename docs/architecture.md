# Architektur: modulare Apps mit React-Lib

Stand 20. November 2026 auf `react-lib-refactor`. Die Desktop-Frontends beziehen `v0.5.0`.

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

Für den Einbau zuerst die [Anwendungsübersicht mit Beispielen](../README.md#einstieg-für-menschen-und-agenten) öffnen. Dieser Abschnitt beschreibt die gemeinsame Architektur.

1. `pnpm add github:Neyu703/React-Lib#<Tag>` (Tags: `v0.4.0` stabil, `v0.5.0-rc.N` Vorabversion). Optional `pnpm add @reduxjs/toolkit react-redux` (Peers).
2. Store: `{ [REACT_LIB_STATE_KEY]: reactLibReducer }` zu den eigenen Reducern. Ein Store für die ganze App, auch für das Anmelde-Gate.
3. SCSS: `@use "@neyu703/react-lib/scss/base";` (Tokens, Reset) und `@use "@neyu703/react-lib/scss/styles";` vor den App-Stilen. Bei eigener Palette die benötigten Lib-Tokens auf die App-Variablen abbilden, etwa `--tint`, `--label-secondary`, `--bg-card` und für Statusanzeigen `--green`, `--orange`, `--red`. EXEBuilder bindet die Komponentenstile per SCSS ein und mappt die Farben in `frontend/src/styles/_tokens.scss`. Dienstplan lädt die gebauten Komponentenstile in `main.tsx` vor dem eigenen SCSS. StoreRename begrenzt die Komponentenstile vorerst auf seine React-Bereiche.
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
- Lib-Release: Version in `package.json`, `pnpm build`, `pnpm test` (100 %), Commit inkl. `dist`, Tag `vX.Y.Z`, Push von Branch und Tag. Apps pinnen den Tag (`github:Neyu703/React-Lib#v0.5.0`), nie einen lokalen `file:`-Link.
- Vor dem Merge in den jeweiligen Hauptbranch die App im Browser oder WebView2 prüfen und den Pin auf das gemeinsame Release umstellen. StoreRename verwendet `develop` als Hauptbranch.

## Stand der Repos (react-lib-refactor)

| Repo | Inhalt |
|---|---|
| React-Lib | `v0.5.0` enthält neue Buttons, Auswahl, Status und Tabs. `Select` um native Attribute und gesperrte Optionen, `Tabs` um vertikale Navigation, Sperrhinweise und eine von der App gesteuerte Auswahl. `JobSteps` lässt sich in einer eigenen Fortschrittsansicht rendern. |
| Dienstplan | Komponenten, Dialoge, Anmeldung aus der Lib; Backend nutzt `job_progress`/`install_update` aus Packages |
| Schichtplan | Gemeinsamer Redux-Store, `LoginGate`, `StatusPill` für den Setup-Status und SCSS-Basis. |
| ConfigEditor | FastAPI, Redux, SCSS. Nutzt Suche, Ladeplatzhalter, `Select` für die Projektwahl und `Button` für Dateiaktionen. |
| EXEBuilder | Verwendet `Tabs`, `StatusPill` und `Skeleton`. Die Tab-Auswahl wird weiterhin in den App-Einstellungen gespeichert. |
| StoreRename | FastAPI-Backend (`webserver/`). Der Web-Build übernimmt Suche, Suchfilter, Neu-Laden, Verbindungsstatus und Update-Dialog in React. Der übrige Ablauf liegt in der bestehenden HTML-Oberfläche (`docs/react-migration-plan.md`). |
| Misc/Packages | `job_progress`, `install_update` fertig; `entra_auth/frontend` entfernt |
| StrongCSVVisualizer, coords-checklist, WebDeployment | `main` auf Vorumbau-Stand zurückgesetzt (Revert); `base-css` ist archiviert, die Lib enthält Tokens, Reset und Mixins |

## Nachweis und offene Punkte

- Geprüft wurden die fünf Frontend-Builds, 439 Lib-Tests mit 100 % Coverage und 786 StoreRename-Python-Tests. Ein Chrome-Test mit simuliertem Backend deckte die portierten StoreRename-Bedienelemente ab. Sichtprüfung in WebView2, Anmeldung gegen Entra und ein StoreRename-Lauf mit echter Datenbank stehen für diesen Stand noch aus.
- Nach dem nächsten Lib-Tag die validierten ConfigEditor-Formularfelder und die Hauptnavigation des Dienstplans anbinden. Dabei Hilfs- und Fehlermeldungen, die Tab-Reihenfolge und die Gründe für gesperrte Tabs prüfen.
- `Card` und die scrollgebundene `SideNav` gehören weiterhin zum Plan-Layout. EXEBuilder betreibt eigene SSE-Streams für Lebenszeichen und parallele Aktionen. StoreRename behält seine Vorschau, Bestätigungsfrist und Rollback-Logik in der App.
