import type { ReactNode } from "react";

/** Props of `ConfirmView`; `done(true)` = yes, `done(false)` = no or dismissed. */
export interface ConfirmViewProps {
  title: string;
  text: string;
  yesLabel: string;
  preview?: ReactNode;
  done: (answer: boolean) => void;
}
