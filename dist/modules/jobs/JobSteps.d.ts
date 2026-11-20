import type { JobStep } from "./types.js";
export declare const formatDuration: (ms: number) => string;
/** Zeigt Schritte, Zähler und Dauer eines Vorgangs an. Die App liefert die Schritte. */
export declare function JobSteps({ steps, id }: {
    steps: readonly JobStep[];
    id?: string;
}): import("react").JSX.Element;
