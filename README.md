# React-Lib

Gemeinsame React-Komponenten, Redux-Module und SCSS für KTE-Anwendungen. Diese Anleitung verwendet den veröffentlichten Tag `v0.5.0`. Die [Architekturdoku](docs/architecture.md) hält die Entscheidungen und den Umbaustand der Apps fest.

## Einstieg für Menschen und Agenten

1. Im Ziel-Frontend `package.json` und `pnpm-lock.yaml` öffnen. Den installierten Lib-Tag und den vorhandenen Store prüfen.
2. Den passenden Baustein in der Tabelle wählen. Beim Einbau in eine vorhandene App die Datei mit deren Einstieg, Store oder API-Client weiterverwenden.
3. Den Verhaltensvertrag des Bausteins prüfen. Dazu gehören das Format der Werte, die Pflicht-Props, die benötigten Slices und die App-Handler. Bei Abweichungen ist die Typdeklaration des installierten Tags maßgeblich. Im Lib-Checkout zeigen `src/index.ts` und die jeweiligen `src/modules/*/index.ts` die öffentlichen Exporte.
4. Den Build und die betroffenen App-Tests ausführen. Im Browser die konkrete Aktion, ihre Tastaturbedienung und die verwendete Palette prüfen. Bei Tabs oder Dialogpositionen auch einen Neustart prüfen, wenn die App diese speichert.

| Aufgabe | Nachschlagen |
|---|---|
| Neue App oder erste Komponente | [Installation und Schnellstart](#installation-und-schnellstart) |
| Button, Eingabe, Auswahl, Datumsfeld, Platzhalter | [Komponenten ohne Redux](#komponenten-ohne-redux) |
| Tabs, Dialoge, Farben, Fortschritt, Update | [Redux und App-Handler](#redux-und-app-handler), dann das Rezept unter [Module einbinden](#module-einbinden) |
| Microsoft-Anmeldung und Abmelden | [Anmeldung](#anmeldung) |
| Sass, Tokens, eigenes Theme oder statische Seite | [Stile](#stile) |
| App-Tests, Fehlerdiagnose und Veröffentlichung | [Tests](#tests), [Fehlerdiagnose](#fehlerdiagnose), [Entwickeln und versionieren](#entwickeln-und-versionieren) |

## Installation und Schnellstart

Voraussetzung ist ein React-19-Frontend mit pnpm und einem Browser-Build für ESM. Die Lib nutzt React aus der App. Redux Toolkit 2 und React Redux 9 müssen als Peer-Abhängigkeiten auflösbar sein. Der Import aus dem Paketeinstieg setzt eine Browser-Umgebung voraus. Bei serverseitigem Rendering den Einstieg erst auf dem Client laden.

Im Frontend-Verzeichnis installieren. Das GitHub-Repository ist öffentlich.

```powershell
pnpm add "github:Neyu703/React-Lib#v0.5.0"
```

Dieses Beispiel kann als `App.tsx` in einer vorhandenen React-App gerendert werden. Die Eingabe führt ihren Wert in der App.

```tsx
import { useState } from "react";
import { SearchField, StatusPill } from "@neyu703/react-lib";
import "@neyu703/react-lib/base.css";
import "@neyu703/react-lib/styles.css";

export default function App() {
  const [query, setQuery] = useState("");
  const stores = ["Regensburg", "Magdeburg", "Halle"];
  const matches = stores.filter((store) => store.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="container">
      <SearchField id="store-query" label="Filiale suchen" placeholder="z. B. Halle"
        value={query} onChange={setQuery} />
      <StatusPill live tone={matches.length ? "ok" : "neutral"}>{matches.length} Treffer</StatusPill>
      <ul>{matches.map((store) => <li key={store}>{store}</li>)}</ul>
    </main>
  );
}
```

Sass-Projekte binden stattdessen die [SCSS-Einstiege](#stile) im zentralen Stylesheet ein. Für `LoginGate`, `Tabs`, `Modal`, `ColorField` und andere zustandsgebundene Module folgt der [Store-Aufbau](#redux-und-app-handler).

## Komponenten ohne Redux

Alle folgenden Exporte kommen direkt aus `@neyu703/react-lib`. Werte aus einem Eingabefeld gehen über den Callback zurück an die App. Eine eindeutige `id` und eine sichtbare oder zugängliche Beschriftung helfen bei Tastaturbedienung und Komponententests.

### Aktionen und Anzeige

| Export | Einsatz und Vertrag |
|---|---|
| `Button` | Textbutton. `variant` ist `primary`, `secondary` (Standard) oder `danger`. `size` ist `normal` oder `small`. Native Button-Props gelten weiter. Standardtyp ist `button`. Für ein Formular gezielt `type="submit"` setzen. |
| `IconButton` | Pflicht-Props `icon` und `label`. `label` ist zugänglicher Name und Tooltip. `text` ergänzt sichtbaren Text. `IconName` erlaubt `edit`, `trash`, `save`, `close`, `plus`, `swap`, `refresh` und `exit`. Gestaltungsklassen sind etwa `primary` und `danger-solid`. |
| Icons | `CheckIcon`, `CloseIcon`, `EditIcon`, `ExitIcon`, `PlusIcon`, `RefreshIcon`, `SwapIcon` und `TrashIcon` können direkt in eigener Darstellung verwendet werden. Bei einer Aktion die Beschriftung am Button anbringen. |
| `StatusPill` | Kurzer Status mit Inhalt und `tone="ok"`, `"warn"`, `"fail"` oder `"neutral"`. `live` setzt `role="status"`, etwa für ein Ergebnis nach einem Abruf. |
| `InfoTip` | Kleiner visueller Infohinweis neben einer Überschrift. Pflichtangaben und Formularfehler zusätzlich direkt im Formular anzeigen. |
| `WizardSteps` | Zeigt `steps: string[]` an. `current` ist nullbasiert. Die App steuert Weiter, Zurück und Validierung. |

```tsx
import { Button, IconButton, InfoTip, WizardSteps } from "@neyu703/react-lib";

export function Actions({ save, reload }: { save: () => void; reload: () => void }) {
  return (
    <section>
      <h2>Import <InfoTip>Prüfe die Quelle, bevor der Import startet.</InfoTip></h2>
      <WizardSteps steps={["Quelle", "Prüfung", "Import"]} current={1} />
      <IconButton icon="refresh" label="Quelle neu laden" text="Neu laden" onClick={reload} />
      <Button variant="primary" onClick={save}>Speichern</Button>
    </section>
  );
}
```

### Auswahl, Suche und Feldbeschriftung

| Export | Einsatz und Vertrag |
|---|---|
| `SearchField` | `id`, `label`, `value` und `onChange(value)`. `placeholder` übernimmt standardmäßig `label`. Leeren und Escape bei gefülltem Feld melden `""`. Debounce und Serverabfragen organisiert die App. |
| `Select` | Native Auswahl mit `id`, `label`, `value`, `onChange(value)` und `options` als Liste aus `[Wert, Text]`. Unterstützt `disabled` und `className`. |
| `Segmented` | Kurze Auswahl mit bis zu acht Optionen. `options` enthält `[Wert, Text, Tooltip?]`. `onPick(wert)` meldet die Wahl. `id`, `label` und `value` sind Pflicht. |
| `PreviewSelect` | `options` enthält Objekte mit `value` und `label`. `onPreview(wert)` meldet den Eintrag unter Maus oder Tastatur. `onChange(wert)` übernimmt eine bestätigte Auswahl. Beim Schließen meldet `onPreview(null)` das Ende der Vorschau. |
| `Float` | Umhüllt ein Eingabefeld mit einer schwebenden Beschriftung. Ein normales Text- oder Zahlenfeld braucht `placeholder=" "`. Bei einer Auswahl sitzt die Beschriftung oben. `required`, `missing` und `always` steuern die Darstellung. Die Gültigkeit des Feldes prüft die App. |

```tsx
import { useState } from "react";
import { Float, PreviewSelect, Segmented, Select } from "@neyu703/react-lib";

export function DisplaySettings() {
  const [mode, setMode] = useState("system");
  const [range, setRange] = useState("week");
  const [palette, setPalette] = useState("blue");
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section>
      <Segmented id="mode" label="Darstellung" value={mode} onPick={setMode}
        options={[["system", "System", "Folgt dem Betriebssystem"], ["dark", "Dunkel"]]} />
      <Float label="Zeitraum">
        <Select id="range" label="Zeitraum" value={range} onChange={setRange}
          options={[["week", "Woche"], ["month", "Monat"]]} />
      </Float>
      <PreviewSelect id="palette" label="Palette" value={palette} onChange={setPalette}
        options={[{ value: "blue", label: "Blau" }, { value: "green", label: "Grün" }]}
        onPreview={setPreview} />
      <p>Aktuelle Vorschau: {preview ?? palette}</p>
    </section>
  );
}
```

`Select` reicht Attribute wie `aria-describedby` und `aria-invalid` an das native Feld durch. Die optionale dritte Angabe einer Option sperrt diese. Damit kann eine App etwa einen ungültigen gespeicherten Wert als `["old", "Ungültiger Dateiwert", true]` anzeigen und gleichzeitig eine gültige Korrektur erlauben.

### Datum, Kalenderwoche und Uhrzeit

| Export | Einsatz und Vertrag |
|---|---|
| `DateField` | Sichtbar `TT.MM.JJJJ` mit Kalender, im App-State `YYYY-MM-DD` oder `""`. `value` und `onChange` sind Pflicht. `id`, `min` als ISO-Datum, `required` und `disabled` sind optional. |
| `WeekField` | Sichtbar etwa `KW 47/2026`, im App-State `2026-W47` oder `""`. `min` hat ebenfalls das Wochenformat. Die übrigen Props entsprechen `DateField`. |
| `TimeField` | Auswahl über Stunden- und Minutenräder. `value` ist `HH:MM` oder `""`. `name` und `required` sind optional. |
| `CalendarPopover` | Für einen eigenen Kalender-Trigger. Erwartet `popoverRef`, `position`, `value` als ISO-Datum, `label` und `onPick(iso)`. `min` sperrt frühere Daten, `required` blendet „Leeren“ aus. `weekly` markiert die ganze Woche. Der Callback liefert weiter ein Datum. Öffnen, Schließen und Positionieren gehören zum eigenen Trigger. |
| `Wheel` | Endlosrad für Werte von `0` bis `count - 1`. Erwartet `count`, `value`, `label` und `onSelect(number)`. |

`min` sperrt zu frühe Einträge im Kalender. Fachliche Grenzen, auch bei manuell eingetippten Werten, am Formular und am API-Eingang prüfen.

```tsx
import { useState } from "react";
import { DateField, Float, TimeField, WeekField } from "@neyu703/react-lib";

export function SchedulingFields() {
  const [date, setDate] = useState("2026-11-20");
  const [week, setWeek] = useState("2026-W47");
  const [time, setTime] = useState("06:00");

  return (
    <section>
      <Float label="Datum"><DateField id="day" value={date} onChange={setDate} /></Float>
      <Float label="Woche"><WeekField id="week" value={week} onChange={setWeek} /></Float>
      <Float label="Beginn"><TimeField name="start" value={time} onChange={setTime} /></Float>
    </section>
  );
}
```

Für Berechnungen mit gültigen Werten stehen `parseIso` und `toIso` für lokale Kalendertage, `addDays` für Tagesabstände, `mondayOf` für den Wochenbeginn, `isoWeekOf` und `mondayOfIsoWeek` für die ISO-Woche sowie `pad` für die zweistellige Darstellung bereit. `isoWeekOf("2026-11-20")` ergibt `"2026-W47"`. `mondayOfIsoWeek("2026-W47")` ergibt `"2026-11-16"`.

### Ladezustände

- `Loading` tauscht bei `loading={true}` die Kinder gegen `fallback`. Mit `label` bekommt der Ladezustand eine passende Ansage.
- `Skeleton` ist ein Block mit `width`, `height`, `radius`, `circle`, `className` und `style` nach Bedarf. Zahlen für Größen stehen für Pixel, Strings für CSS-Längen.
- `SkeletonLines` simuliert Textzeilen mit `lines` und `lastWidth`. `SkeletonGrid` nutzt `rows`, `columns` und `cellHeight` für Listen oder Tabellen.
- `Ghost` hält die Struktur seiner Kinder als ausgeblendeten und inaktiven Platzhalter im Layout. Die Kinder werden dabei gerendert. Für Komponenten mit Nebenwirkungen einen einfachen Skeleton-Fallback verwenden.

```tsx
import { Loading, SkeletonGrid } from "@neyu703/react-lib";

export function StoreList({ busy, stores }: { busy: boolean; stores: string[] }) {
  return (
    <Loading loading={busy} label="Filialen werden geladen"
      fallback={<SkeletonGrid rows={4} columns={2} cellHeight={32} />}>
      <ul>{stores.map((store) => <li key={store}>{store}</li>)}</ul>
    </Loading>
  );
}
```

## Redux und App-Handler

Redux Toolkit 2 und React Redux 9 sind Peer-Abhängigkeiten. Falls sie im Ziel-Frontend fehlen, `pnpm add @reduxjs/toolkit react-redux` ausführen. Einen vorhandenen App-Store um `[REACT_LIB_STATE_KEY]: reactLibReducer` ergänzen. Der vorhandene `Provider` versorgt dann App und Lib gemeinsam.

```tsx
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { REACT_LIB_STATE_KEY, reactLibReducer, Tabs, useActiveTab } from "@neyu703/react-lib";

const store = configureStore({ reducer: { [REACT_LIB_STATE_KEY]: reactLibReducer } });

function Settings() {
  const active = useActiveTab("settings", "general");

  return (
    <>
      <Tabs group="settings" label="Bereiche" defaultTab="general"
        tabs={[{ id: "general", label: "Allgemein" }, { id: "log", label: "Protokoll", badge: 3 }]} />
      <section aria-label={active === "general" ? "Allgemein" : "Protokoll"}>
        {active === "general" ? "Allgemeine Einstellungen" : "Drei Protokolleinträge"}
      </section>
    </>
  );
}

export default function App() {
  return <Provider store={store}><Settings /></Provider>;
}
```

### Welche Slices braucht ein Modul?

Der vollständige Reducer ist der Standard. Wer gezielt Slices einbindet, kombiniert sie mit `createReactLibReducers([...])` ebenfalls unter `REACT_LIB_STATE_KEY`. Für einen einzelnen Modaldialog etwa `createReactLibReducers([dialogsModule, portalThemeModule])`.

| Feature | Benötigte Module beim selektiven Store |
|---|---|
| `Tabs` und `useActiveTab` | `tabsModule` |
| `LoginGate` und `useAuth` | `authModule`. Thunk-Middleware aktiv lassen. |
| `Modal`, `ConfirmView`, `UpdateDialog`, `ChangelogDialog` | `dialogsModule` und `portalThemeModule` |
| `JobProgress` | `jobsModule`, `dialogsModule` und `portalThemeModule` |
| `ColorField` | `colorFieldModule` |
| `DialogFrame` allein oder `JobSteps` | Reine Darstellung ohne Lib-Slice |

`ALL_REACT_LIB_MODULES` enthält die Module als `ReactLibModule`-Deskriptoren. `confirmModule` und `updaterModule` exportieren Komponenten und haben keinen eigenen Reducer. Ihr `Modal` benötigt die beiden Dialog-Slices.

`selectReactLib(store.getState())` liest den Lib-Zweig außerhalb der Rendering-Logik. Im React-Baum selektiert `useReactLibSelector` daraus einen Wert und reagiert auf Änderungen. `useReactLibDispatch` sendet Actions, `useReactLibThunk` kann zusätzlich Thunks starten. `useReactLibStore` gibt den Store für imperatives Lesen zurück. `ReactLibState` umfasst `TabsState`, `AuthState`, `DialogsState`, `PortalThemeState`, `JobsState` und `ColorFieldState`.

### App-Handler registrieren

`configureReactLib(handlers)` beim Start der App vor ihrem ersten Render aufrufen. Jeder Aufruf ersetzt die gesamte Konfiguration und ergänzt fehlende Handler aus den Defaults. Wer bereits vor der Anmeldung konfiguriert, gibt beim zweiten Aufruf auch den Anmelde-Client wieder mit. `reactLibHandlers()` liest die aktuelle Konfiguration.

| Feld von `ReactLibHandlers` | Aufgabe |
|---|---|
| `authApi` | Optionaler Browser-Client für Sitzung, Anmeldung und Abmelden. Ohne Konfiguration gilt `/api/auth`. |
| `saveDialogBox(id, box)` | Speichert eine geänderte Position oder Größe für die stabile Dialog-ID. Beim Programmstart die gespeicherten Werte per `dialogBoxesLoaded` in den Store übernehmen. |
| `loadCustomColors()`, `saveCustomColors(colors)` | Laden und Speichern einer Liste von Hexfarben. Der Speicher-Handler gibt die tatsächlich gespeicherte Liste zurück. |
| `startUpdate()` | Startet die app-spezifische Installation und liefert `UpdateStatus` mit `state` und `message`. |
| `openTab(tab)` | Öffnet einen Bereich, den ein Link im Änderungsprotokoll anspricht. Die App ordnet die Kennung ihrer eigenen Navigation zu. |
| `autoCloseChanged(value)` | Merkt die Option für automatisches Schließen nach einem erfolgreichen Job. Die App lädt den Wert mit `jobAutoCloseSet` und schließt nach Erfolg gegebenenfalls mit `jobViewCleared`. |

## Module einbinden

### Tabs und Auswahl speichern

`Tabs` speichert die Auswahl getrennt je `group`. `useActiveTab(group, fallback)` liest sie, `tabSelected({ group, tab })` setzt sie aus der App. `TabItem` enthält `id`, `label` und optional `badge`. Pfeil links/rechts, Pos1 und Ende wechseln den Fokus und die Auswahl. `TabsProps` beschreibt die öffentliche Schnittstelle.

Für dauerhafte Auswahl den gespeicherten Wert als `defaultTab` und als Fallback an `useActiveTab` übergeben. Nach einer Auswahl kann ein Redux-Listener auf `tabSelected` reagieren und den Wert in den App-Einstellungen speichern. EXEBuilder macht das mit der Gruppe `pages` und `/api/settings`. Den Listener auf die eigenen Gruppen und gültigen IDs begrenzen.

Mit `activeTab` und `onTabChange` kann die App eine bereits vorhandene Auswahl direkt anbinden. `orientation="vertical"` nutzt Pfeil hoch/runter. `icon`, `disabled` und `title` erlauben eine Seitenleiste mit Sperrhinweisen. Bei einer nicht mehr gültigen ID bietet die Leiste den ersten verfügbaren Tab an. Den dazugehörigen App-Inhalt und die gespeicherte Auswahl entscheidet die App.

### Anmeldung

`LoginGate` prüft die Sitzung und rendert seine Kinder bei deaktivierter Anmeldung oder bestehender Sitzung. `LoginGateProps` beschreibt die Eingaben, `AuthPhase` die Zustände des Gates im Store. `useAuth()` liefert `user` und `signOut()`. Beide laufen unter dem gemeinsamen Redux-Provider. Die konkrete Integration zeigt Schichtplan in `main.tsx` und `authClient.ts`.

```tsx
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Button, LoginGate, REACT_LIB_STATE_KEY, configureReactLib, createAuthApi,
  reactLibReducer, useAuth } from "@neyu703/react-lib";

const store = configureStore({ reducer: { [REACT_LIB_STATE_KEY]: reactLibReducer } });
configureReactLib({ authApi: createAuthApi() });

function SignedInView() {
  const { user, signOut } = useAuth();
  return user ? <Button onClick={() => void signOut()}>Abmelden ({user.name})</Button> : <p>Willkommen</p>;
}

export default function App() {
  return (
    <Provider store={store}>
      <LoginGate title="Schichtplan" loading={<p>Anmeldung wird geprüft …</p>}>
        <SignedInView />
      </LoginGate>
    </Provider>
  );
}
```

Der Standardclient spricht `GET /api/auth/session`, `POST /api/auth/login` und `POST /api/auth/logout` an. `createAuthApi({ basePath, headers })` passt den Pfad und die zusätzlichen Header für die beiden POSTs an. Der Typ dafür heißt `AuthApiOptions`. Bei einem Starttoken den aktuellen Wert jeweils in `headers()` lesen. `AuthSession` enthält `authRequired` und `user`, `AuthUser` die Felder `id`, `name` und `username`. Ein eigener Client implementiert `AuthApi`. Im Python-Backend stellt `Misc/Packages/entra_auth` mit `install_auth` den Vertrag bereit. Geschützte App-Endpunkte prüfen ihre Sitzung auf dem Server.

### Dialoge, Bestätigen und Fensterdarstellung

`Modal` steuert das native Dialogelement. `DialogFrame` liefert Titel, scrollenden Inhalt und Aktionen. Mit `onSubmit` rendert der Rahmen ein Formular. Ohne `onSubmit` eignet er sich für reine Anzeigen und freie Button-Aktionen.

```tsx
import { useState } from "react";
import { Button, DialogFrame, Modal } from "@neyu703/react-lib";

export function ReportDialog() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Bericht ansehen</Button>
      <Modal id="report" windowTitle="Bericht" open={open} onClose={close} labelledBy="report-title">
        <DialogFrame title="Bericht" titleId="report-title" actions={<Button onClick={close}>Schließen</Button>}>
          <p>Der Bericht wurde erstellt.</p>
        </DialogFrame>
      </Modal>
    </>
  );
}
```

- Für eine einfache Rückfrage `ConfirmView` nur bei offener Rückfrage mounten. `ConfirmViewProps` umfasst `title`, `text`, `yesLabel`, optional `preview` und `done(answer)`. Bestätigen ergibt `true`, Abbrechen oder Schließen `false`. Die App führt die Aktion erst nach `true` aus.
- `portalThemeSet({ dialogMode, attributes, cssVariables })` übergibt das Aussehen und den Modus. `"float"` ist verschiebbar, `"window"` öffnet ein eigenes Browserfenster. Bei blockierten Popups weicht die Lib auf einen verschiebbaren Dialog aus. Andere Werte ergeben ein festes Modal. Für eigene Fenster kann `applyPortalTheme(root, theme)` die Werte direkt auf ein Wurzelelement anwenden.
- `dialogLimitSet(2)` erlaubt zwei normale Dialoge. Beim weiteren Öffnen wird der älteste verdrängt. `exempt` hält einen Dialog fest und nimmt ihn vom Limit aus. `blockEscape` blockiert Escape, etwa während einer laufenden Aktion.
- `dialogBoxesLoaded(boxes)` lädt bekannte Positionen. `DialogBoxes` ordnet jeder ID einen `DialogBox` zu. `x` und `y` sind Anteile am freien Platz von `0` bis `1`. `width` und `height` sind optionale CSS-Längen. `dialogBoxesReset()` leert den Lib-Zustand. Gespeicherte Daten löscht die App separat.
- `Modal` registriert seine Öffnungen mit `dialogOpened` und `dialogClosed`. Eigene Dialogimplementierungen können `dialogBoxSaved` für Redux oder `saveDialogBox(store, id, element)` für Redux und Host-Speicherung verwenden. Für eine bewusst angepasste Desktop-Oberfläche kann `blockNativeContextMenu(document)` beim Start das native Kontextmenü unterdrücken.

### Farbauswahl

`ColorField` erwartet einen Hexwert im Format `#RRGGBB` und `onChange`. `id`, `name` und `ariaLabel` sind optional. Ein Farbzug meldet den Wert beim Loslassen. Eigene Farben lädt die Lib beim Öffnen über `loadCustomColors`. Speichern läuft über `saveCustomColors`. `customColorsSet(list)` kann gespeicherte Farben auch direkt in den Lib-Store laden.

```tsx
import { useState } from "react";
import { ColorField, configureReactLib } from "@neyu703/react-lib";

const storageKey = "demo.custom-colors";
configureReactLib({
  loadCustomColors: async () => (JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]),
  saveCustomColors: async (colors) => {
    localStorage.setItem(storageKey, JSON.stringify(colors));
    return colors;
  },
});

export function HighlightColor() {
  const [color, setColor] = useState("#0067c0");
  return <ColorField id="highlight" ariaLabel="Hervorhebungsfarbe" value={color} onChange={setColor} />;
}
```

Das Demo speichert lokal unter einem stabilen Browser-Origin. Für Desktop-Apps mit wechselndem Port die App-Einstellungen oder eine Serverdatei nutzen. Den Farbwert der eigentlichen Einstellung speichert die App über ihren eigenen Ablauf. `CustomColorsResponse` ist der exportierte Typ für die Farbliste.

### Jobfortschritt

`JobProgress` einmal unter dem Provider rendern. Er wird sichtbar, sobald die App eine `JobView` per `jobViewSet` übergibt. Die App pollt oder empfängt Fortschrittsereignisse und schreibt jeden Stand in den Store. Bei einem Abschluss `running: false` setzen. `jobViewCleared()` entfernt die Ansicht.

```tsx
import { JobProgress, jobViewSet, useReactLibDispatch } from "@neyu703/react-lib";

export function JobExample() {
  const dispatch = useReactLibDispatch();
  return (
    <>
      <button type="button" onClick={() => dispatch(jobViewSet({
        snapshot: {
          job: 1, next: 1, title: "Filialen einlesen", running: false, ok: true,
          steps: [{ label: "Datei einlesen", status: "done", current: 12, total: 12,
            detail: "12 Filialen erkannt", duration_ms: 1500 }],
          events: [{ level: "info", ms: 1500, text: "Datei eingelesen" }],
        },
        events: [{ level: "info", ms: 1500, text: "Datei eingelesen" }],
        running: false, elapsed: 1500,
      }))}>Beispiel anzeigen</button>
      <JobProgress />
    </>
  );
}
```

`JobSnapshot` steht für eine Serverantwort mit Job-ID und Cursor `next`. Bei inkrementellen Abfragen die neuen `events` pro Job sammeln und der `JobView` vollständig übergeben. `JobStep` beschreibt Schrittstatus, Zähler, Detail und Dauer. `JobEvent` verwendet Millisekunden relativ zum Start. `JobView.elapsed` ist ebenfalls in Millisekunden. Dienstplan nutzt dafür `install_jobs` aus `Misc/Packages/job_progress` und sammelt die Antworten in `frontend/src/lib/reactLibHost.ts`.

`<JobSteps steps={snapshot.steps} />` ist eine eigenständige Schrittliste für eine eigene Fortschrittsansicht. Der App-Code verwaltet Polling, Abbruch, Bestätigung und Datenhaltung. Sie passt beispielsweise zu einer App, die die Transaktionsentscheidung neben dem Fortschritt zeigt.

### Update und Änderungsprotokoll

- `UpdateDialog` nur rendern, wenn die App eine Aktualisierung anbieten will. `info` ist ein `UpdateInfo` mit `state` und Beschreibung `info`. `onClose(silence)` liefert zurück, ob die App den Hinweis bis zum nächsten Start ausblenden soll. „Jetzt aktualisieren“ ruft `startUpdate` aus den App-Handlern auf. Eine Antwort mit `state: "failed"` zeigt `message` an und erlaubt einen weiteren Versuch.
- `ChangelogDialog` erhält `data: ChangelogData` mit `entries` und `hidden`. Ein `ChangelogEntry` hat `group`, `date`, `title` und `text`. Die App liefert Einträge gruppiert in Anzeigereihenfolge und speichert den Wert aus `onClose(hidden)`. Im Text wird `{settings|Einstellungen öffnen}` zu einem Link, der `openTab("settings")` aufruft. Dienstplan bindet beide Dialoge in `App.tsx` an und nutzt `install_update` aus `Misc/Packages/auto_updater` für die Update-Endpunkte.
- Hat die App eigene Sperrzustände oder Installationsschritte, kann sie den eigenen Ablauf mit `Modal`, `DialogFrame` und `Button` abbilden. StoreRename verwendet diese Kombination für die Sperre während einer laufenden Umbenennung.

```tsx
import { ChangelogDialog, UpdateDialog, type ChangelogData, type UpdateInfo } from "@neyu703/react-lib";

export function ReleaseNotices({
  update, changelog, closeUpdate, closeChangelog,
}: {
  update: UpdateInfo | null;
  changelog: ChangelogData | null;
  closeUpdate: (silence: boolean) => void;
  closeChangelog: (hidden: boolean) => void;
}) {
  if (update) return <UpdateDialog info={update} onClose={closeUpdate} />;
  if (changelog) return <ChangelogDialog data={changelog} onClose={closeChangelog} />;
  return null;
}
```

Die App lädt beide Antworten, registriert `startUpdate` und `openTab` in ihrer gemeinsamen Host-Konfiguration und setzt die jeweilige Antwort beim Schließen auf `null`.

## Stile

Eine Sass-App lädt Tokens und Reset zuerst, dann Komponentenstile und zuletzt die eigenen Regeln.

```scss
@use "@neyu703/react-lib/scss/base";
@use "@neyu703/react-lib/scss/styles";
@use "@neyu703/react-lib/scss/mixins" as lib;

.summary {
  @include lib.card;
}
```

| Einstieg | Wann er passt |
|---|---|
| `@neyu703/react-lib/scss/base` / `@neyu703/react-lib/base.css` | Tokens, Reset und `.container`. `base.css` ist die gebaute Variante für Projekte ohne Sass. |
| `@neyu703/react-lib/scss/styles` / `@neyu703/react-lib/styles.css` | Alle Komponentenstile. In Projekten ohne Sass CSS-Imports am Browser-Einstieg verwenden. |
| `@neyu703/react-lib/scss/auth-gate` | Nur die Styles für die Anmeldemaske bei Sass-Nutzung. |
| `@neyu703/react-lib/scss/mixins` | Sass-Helfer für Typografie (`title-large`, `title`, `headline`, `body`, `subhead`, `footnote`), Eingabeziele (`tap-target`), Flächen und Layouts (`card`, `card-section`, `tile`, `two-column-grid`, `grouped-list`, `filled-button`). Benötigen die Basis-Tokens. |
| `@neyu703/react-lib/search-field.css` | Gebautes CSS für eine eigenständige Suche. Dienstplan kopiert es für seine statische Hilfe beim App-Build. |
| `@neyu703/react-lib/package.json` | Versions- und Paketmetadaten zur Diagnose. |

Eine statische Seite ohne Bundler kann `node_modules/@neyu703/react-lib/dist/base.css` in ihre lokalen Assets kopieren und per `<link rel="stylesheet">` einbinden. Ein festes Kopierskript hält die Datei beim nächsten Versionswechsel auf dem aktuellen Stand.

### Theme und Fenstergröße

Bei eigener Palette die Lib-Variablen auf die App-Farben abbilden. Ein Baustein, der grün, orange oder rot darstellen soll, braucht neben den allgemeinen Tokens auch `--green`, `--orange` und `--red`.

```scss
:root {
  --tint: var(--app-accent);
  --on-tint: var(--app-on-accent);
  --label: var(--app-text);
  --label-secondary: var(--app-text-muted);
  --bg-card: var(--app-surface);
  --separator: var(--app-border);
  --fill: var(--app-fill);
  --fill-hover: var(--app-hover);
  --green: var(--app-success);
  --orange: var(--app-warning);
  --red: var(--app-error);
}
```

`--radius-*`, `--tap-target`, `--safe-*`, `--gutter`, `--content-width` und `--text-*` steuern Radien, Klickflächen, Bildschirmränder, Seitenbreiten und Typografie. Die Basis berücksichtigt `prefers-color-scheme`. Bei Maus oder Trackpad sinkt `--tap-target` von 44 px auf 36 px.

| Fensterklasse | Breite | `--gutter` | `--content-width` |
|---|---:|---:|---:|
| compact | unter 600 px | 16 px | 100 % |
| medium | 600–839 px | 24 px | 640 px |
| expanded | 840–1199 px | 32 px | 760 px |
| large | ab 1200 px | 32 px | 880 px |

Für `Segmented` gibt es eigene Overrides wie `--segmented-track`, `--segmented-thumb`, `--segmented-muted`, `--segmented-selected` und `--segmented-focus`. `--segmented-border`, `--segmented-thumb-border`, `--segmented-shadow`, `--segmented-padding` und `--segmented-font-size` ändern seine Form und Abstände.

## Tests

App-Tests prüfen die App-Aktion und den sichtbaren Effekt. Testumgebung und Runner kommen aus der App. Die Hilfen unter `@neyu703/react-lib/testing` benötigen `@testing-library/react` und eine DOM-Umgebung wie jsdom.

```tsx
// @vitest-environment jsdom
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Tabs } from "@neyu703/react-lib";
import { installDomStubs, libState, renderWithLibStore, resetReactLib } from "@neyu703/react-lib/testing";

installDomStubs();
afterEach(resetReactLib);

it("wechselt mit der Tastatur zum Protokoll", () => {
  const { store } = renderWithLibStore(
    <Tabs group="settings" label="Bereiche"
      tabs={[{ id: "general", label: "Allgemein" }, { id: "log", label: "Protokoll" }]} />,
  );

  fireEvent.keyDown(screen.getByRole("tab", { name: "Allgemein" }), { key: "ArrowRight" });
  expect(libState(store).tabs.active.settings).toBe("log");
});
```

- `createTestStore(preloaded?, extraReducers?)` erstellt einen Store mit der Lib und bei Bedarf App-Reducern. Wenn bereits ein App-Teststore aufgebaut wird, diesen gemeinsam mit der Lib unter dem App-Provider verwenden. `TestStore` und `TestRootState` sind die Typen des Testhelfers.
- `renderWithLibStore(ui, store?)` rendert unter einem Provider und gibt `store` zurück. `libState(store)` liest den Lib-Zustand für Assertions.
- `installDomStubs()` ergänzt Dialogmethoden und Pointer-Capture, die in jsdom fehlen können.
- `fakeAuthApi(overrides?)` simuliert standardmäßig eine deaktivierte Anmeldung. Für einen Anmeldetest etwa `loadSession` mit `{ authRequired: true, user: null }` und `signIn` mit einem Testnutzer überschreiben und mit `configureReactLib({ authApi })` registrieren.
- `resetReactLib()` setzt nach dem Test die globalen Host-Handler zurück.

## Fehlerdiagnose

| Symptom | Prüfen |
|---|---|
| Export fehlt oder TypeScript kennt eine Prop nicht | Installierten Tag und die Typdeklaration unter `dist` prüfen. |
| Redux-Kontext fehlt oder ein Slice ist `undefined` | Provider, `REACT_LIB_STATE_KEY` und die benötigten Reducer aus der Tabelle prüfen. Ein Modaldialog liest sowohl `dialogs` als auch `portalTheme`. |
| `window is not defined` | Import aus dem Paketeinstieg in die Browser-Grenze verschieben. |
| Komponenten sind ungestylt oder verwenden falsche Farben | Lib-Stile vor den App-Stilen laden. Tokens am gemeinsamen Vorfahren prüfen. Bei Dialogen im eigenen Fenster `portalThemeSet` und die übernommenen Variablen kontrollieren. |
| Buttons tun nichts oder gespeicherte Werte fehlen | App-Handler vor dem Render registrieren. Bei einem zweiten `configureReactLib`-Aufruf die erste Konfiguration wieder mitgeben. |
| Tab springt nach Neustart zurück | Gespeicherten Wert vor dem Render laden und als Fallback übergeben. Prüfen, dass die App ihre Auswahl tatsächlich speichert. |
| Job-Dialog zeigt ein altes oder wiederholtes Protokoll | Job-ID und Cursor je Job führen. Bei neuem Auftrag die Ereignisliste neu beginnen und die `JobView` bis zum Abschluss aktualisieren. |
| Test meldet fehlendes `showModal` oder übernimmt Handler aus einem anderen Test | `installDomStubs()` im Testsetup und `resetReactLib()` nach jedem Test verwenden. |

## Entwickeln und versionieren

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
pnpm pack
```

Der Build erzeugt JavaScript, Deklarationen und CSS in `dist`. Die Lib verlangt 100 % für Statements, Branches, Functions und Lines. Vor einem neuen Tag die Paketversion, `dist` und den Inhalt des gepackten Archivs prüfen. Apps referenzieren den veröffentlichten Git-Tag mit aktualisiertem Lockfile.

Bei einer öffentlichen API-Änderung das passende Beispiel und die Tabelle in dieser README im selben Diff mitpflegen. Beispiele gegen den dokumentierten Tag prüfen. Änderungen an Zuständigkeiten, Datenflüssen und Hauptbranches gehören in die [Architekturdoku](docs/architecture.md).
