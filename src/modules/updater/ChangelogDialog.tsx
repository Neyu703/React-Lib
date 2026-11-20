import { useState } from "react";
import { InfoTip } from "../../InfoTip.js";
import { DialogFrame, Modal } from "../dialogs/index.js";
import { reactLibHandlers } from "../../core/host.js";
import type { ChangelogData, ChangelogEntry } from "./types.js";

/** Entry text: {tab|Label} becomes a link that opens that tab. */
function ChangelogText({ text, onTab }: { text: string; onTab: (tab: string) => void }) {
  const parts: React.ReactNode[] = [];
  const pattern = /\{(\w+)\|([^}]+)\}/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    parts.push(text.slice(last, match.index));
    const tab = match[1] as string;
    parts.push(
      <a
        key={match.index}
        href="#"
        className="tab-link"
        data-tab={tab}
        onClick={(event) => {
          event.preventDefault();
          onTab(tab);
        }}
      >
        {match[2]}
      </a>,
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

export function ChangelogDialog({
  data,
  onClose,
}: {
  data: ChangelogData;
  onClose: (hidden: boolean) => void;
}) {
  const [hidden, setHidden] = useState(data.hidden);
  const groups: { name: string; entries: ChangelogEntry[] }[] = [];
  data.entries.forEach((entry) => {
    const last = groups[groups.length - 1];
    if (last && last.name === entry.group) last.entries.push(entry);
    else groups.push({ name: entry.group, entries: [entry] });
  });
  return (
    <Modal
      id="changelog-dialog"
      windowTitle="Neuigkeiten"
      open
      labelledBy="changelog-title"
      onClose={() => onClose(hidden)}
    >
      <DialogFrame
        id="changelog-form"
        titleId="changelog-title"
        title={
          <>
            Feature-Log{" "}
            <InfoTip>
              Alle Funktionen des Dienstplans, neueste zuerst. Du findest sie jederzeit über
              „Feature-Log“ oben rechts.
            </InfoTip>
          </>
        }
        onSubmit={(event) => {
          event.preventDefault();
          onClose(hidden);
        }}
        actionsClassName="changelog-actions"
        actions={
          <>
            <label className="inline-check">
              <input
                type="checkbox"
                id="changelog-hide"
                checked={hidden}
                onChange={(event) => setHidden(event.target.checked)}
              />{" "}
              Nicht nochmal anzeigen
            </label>
            <button
              type="submit"
              className="primary"
            >
              Schließen
            </button>
          </>
        }
      >
        <div id="changelog-entries">
          {groups.map((group, index) => {
            const single = group.entries.length === 1 && !group.entries[0]?.title;
            return (
              <details
                className="changelog-group"
                key={group.name + index}
                open={index === 0}
              >
                <summary>
                  {group.name}
                  {single ? (
                    <>
                      {" "}
                      <span className="muted">{group.entries[0]?.date}</span>
                    </>
                  ) : null}
                </summary>
                {group.entries.map((entry, at) =>
                  entry.title ? (
                    <details
                      className="changelog-entry"
                      open
                      key={at}
                    >
                      <summary>
                        {entry.title} <span className="muted">{entry.date}</span>
                      </summary>
                      <p>
                        <ChangelogText
                          text={entry.text}
                          onTab={(tab) => {
                            onClose(hidden);
                            reactLibHandlers().openTab(tab);
                          }}
                        />
                      </p>
                    </details>
                  ) : (
                    <p key={at}>
                      <ChangelogText
                        text={entry.text}
                        onTab={(tab) => {
                          onClose(hidden);
                          reactLibHandlers().openTab(tab);
                        }}
                      />
                    </p>
                  ),
                )}
              </details>
            );
          })}
        </div>
      </DialogFrame>
    </Modal>
  );
}
