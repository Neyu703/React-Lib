/**
 * jsdom has no pointer capture and no show/showModal/close for <dialog>; installs stand-ins
 * (`show`/`showModal` set the `open` attribute, `showModal` also sets `data-modal="true"`).
 */
export declare function installDomStubs(): void;
