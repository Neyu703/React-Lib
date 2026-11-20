import type { FormEvent, ReactNode } from "react";

interface DialogFrameProps {
  /** Id of the form (or of the plain frame without `onSubmit`). */
  id?: string;
  title: ReactNode;
  /** Shown beside the title in the head, e.g. a `WizardSteps` bar. */
  headExtra?: ReactNode;
  /** Id of the heading, for the dialog's `aria-labelledby`. */
  titleId?: string;
  /** Makes the frame a form; without it the frame is a plain container. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  noValidate?: boolean;
  /** The buttons in the footer. */
  actions: ReactNode;
  /** Extra class of the footer, e.g. to lay out a checkbox beside the buttons. */
  actionsClassName?: string;
  children: ReactNode;
}

/** The frame every dialog shares: head with the title and a divider, scrolling content, footer with the actions. */
export function DialogFrame({
  id,
  title,
  headExtra,
  titleId,
  onSubmit,
  noValidate,
  actions,
  actionsClassName,
  children,
}: DialogFrameProps) {
  const parts = (
    <>
      <div className="dialog-head">
        <h2 id={titleId}>{title}</h2>
        {headExtra}
      </div>
      <div className="dialog-content">{children}</div>
      <div
        className={["dialog-actions", "dialog-foot", actionsClassName ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {actions}
      </div>
    </>
  );
  return onSubmit ? (
    <form
      autoComplete="off"
      method="dialog"
      id={id}
      className="dialog-frame"
      noValidate={noValidate}
      onSubmit={onSubmit}
    >
      {parts}
    </form>
  ) : (
    <div
      id={id}
      className="dialog-frame"
    >
      {parts}
    </div>
  );
}
