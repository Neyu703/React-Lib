import type { UpdateInfo } from "./types.js";
export declare function UpdateDialog({ info, onClose, }: {
    info: UpdateInfo;
    onClose: (silence: boolean) => void;
}): import("react").JSX.Element;
