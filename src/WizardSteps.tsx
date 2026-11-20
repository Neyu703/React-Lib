/** The numbered step bar of the wizard and of the guides: finished steps are ticked, the current one is highlighted. */
export function WizardSteps({
  id,
  steps,
  current,
}: {
  id?: string;
  steps: string[];
  current: number;
}) {
  return (
    <ol
      id={id}
      className="wizard-steps"
    >
      {steps.map((title, at) => (
        <li
          key={title}
          className={at === current ? "current" : at < current ? "done" : undefined}
          aria-current={at === current ? "step" : undefined}
        >
          <span>{title}</span>
        </li>
      ))}
    </ol>
  );
}
