import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, type MouseEvent, useState } from "react";

const VISIBLE_CHIPS = 8;

type RecipientChipsProps = {
  recipients: string[];
  draft: string;
  invalid: string[];
  onDraftChange: (value: string) => void;
  onCommitDraft: () => void;
  onPasteText: (value: string) => void;
  onRemove: (email: string) => void;
  onClear: () => void;
};

export const RecipientChips = ({
  recipients,
  draft,
  invalid,
  onDraftChange,
  onCommitDraft,
  onPasteText,
  onRemove,
  onClear,
}: RecipientChipsProps) => {
  const [listOpen, setListOpen] = useState(false);
  const hiddenCount = Math.max(0, recipients.length - VISIBLE_CHIPS);
  const visible = recipients.slice(0, VISIBLE_CHIPS);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onDraftChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      onCommitDraft();
    }
    if (event.key === "Backspace" && draft.length === 0 && recipients.length > 0) {
      const last = recipients[recipients.length - 1];
      if (last) {
        onRemove(last);
      }
    }
  };

  const handleBlur = () => {
    onCommitDraft();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (text.includes("@") && (text.includes(",") || text.includes(";") || text.includes("\n"))) {
      event.preventDefault();
      onPasteText(text);
    }
  };

  const handleClear = () => {
    onClear();
    setListOpen(false);
  };

  const handleOpenList = () => {
    setListOpen(true);
  };

  const handleCloseList = () => {
    setListOpen(false);
  };

  return (
    <div>
      <div className="chip-field">
        {visible.map((email) => (
          <RecipientChip key={email} email={email} onRemove={onRemove} />
        ))}
        {hiddenCount > 0 && (
          <button className="chip chip-more" type="button" onClick={handleOpenList}>
            +{hiddenCount} more
          </button>
        )}
        <input
          className="chip-input"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={recipients.length === 0 ? "Type or paste many emails" : "Add another"}
        />
      </div>
      <div className="to-meta">
        <span>
          {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
        </span>
        {recipients.length > 0 && (
          <button className="text-btn" type="button" onClick={handleOpenList}>
            View all
          </button>
        )}
        {recipients.length > 0 && (
          <button className="text-btn" type="button" onClick={handleClear}>
            Clear all
          </button>
        )}
      </div>
      {invalid.length > 0 && (
        <p className="field-error">
          Skipped {invalid.length} invalid value{invalid.length === 1 ? "" : "s"}
          {invalid.length <= 5 ? `: ${invalid.join(", ")}` : ""}
        </p>
      )}
      {listOpen && (
        <div className="modal-backdrop" role="presentation" onClick={handleCloseList}>
          <div
            className="modal-card"
            role="dialog"
            aria-labelledby="recipient-list-title"
            onClick={stopBubble}
          >
            <div className="modal-head">
              <h3 id="recipient-list-title">All recipients ({recipients.length})</h3>
              <button className="btn btn-ghost" type="button" onClick={handleCloseList}>
                Close
              </button>
            </div>
            <ul className="recipient-list">
              {recipients.map((email) => (
                <RecipientListRow key={email} email={email} onRemove={onRemove} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

type RecipientChipProps = {
  email: string;
  onRemove: (email: string) => void;
};

const stopBubble = (event: MouseEvent<HTMLDivElement>) => {
  event.stopPropagation();
};

const RecipientListRow = ({ email, onRemove }: RecipientChipProps) => {
  const handleRemove = () => {
    onRemove(email);
  };

  return (
    <li className="recipient-list-item">
      <span>{email}</span>
      <button className="text-btn" type="button" onClick={handleRemove}>
        Remove
      </button>
    </li>
  );
};

const RecipientChip = ({ email, onRemove }: RecipientChipProps) => {
  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onRemove(email);
  };

  return (
    <span className="chip">
      {email}
      <button className="chip-remove" type="button" onClick={handleRemove} aria-label={`Remove ${email}`}>
        ×
      </button>
    </span>
  );
};
