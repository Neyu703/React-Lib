# React-Lib

Gemeinsame React-Komponenten für interne KTE-Programme. Die Apps verwenden ihre eigene React-19-Installation.

## Installieren

Im Frontend-Verzeichnis ausführen. Git benötigt Lesezugriff auf `Neyu703/React-Lib`.

```powershell
pnpm add "git+https://github.com/Neyu703/React-Lib.git#v0.1.0"
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

## Entwickeln und versionieren

```powershell
pnpm install --frozen-lockfile
pnpm build
```

Das Paket liefert JavaScript und TypeScript-Deklarationen aus `dist` sowie die gemeinsame CSS-Datei. `dist` gehört zu jedem Release-Commit, damit der Git-Tag direkt installiert werden kann. Vor einem neuen Tag Paketversion erhöhen, bauen und den Paketinhalt mit `pnpm pack` prüfen.
