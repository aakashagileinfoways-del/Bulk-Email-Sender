import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RecipientChips } from "../components/compose/RecipientChips";
import { SendProgress } from "../components/compose/SendProgress";
import { StatusBanner } from "../components/ui/StatusBanner";
import { useSmtpSession } from "../context/smtp-session-context";
import { sendBulkMail } from "../services/send-bulk";
import type { SendSummary } from "../types/models";
import {
  classifyRecipients,
  extractEmails,
  isValidEmail,
  mergeRecipients,
} from "../utils/recipients";
import { toSmtpPayload } from "../utils/smtp";

export const ComposePage = () => {
  const { session } = useSmtpSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [summary, setSummary] = useState<SendSummary | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const fromLine = session ? session.fromEmail : "Add SMTP to send";
  const canSend =
    Boolean(session) &&
    (recipients.length > 0 || isValidEmail(draft) || extractEmails(bulkText).length > 0) &&
    subject.trim().length > 0 &&
    body.trim().length > 0;

  const handleSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSubject(event.target.value);
  };

  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const addIncoming = (incoming: string[], skipped: string[]) => {
    setInvalid(skipped);
    setRecipients((current) => mergeRecipients(current, incoming));
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (value.includes(",") || value.includes(";")) {
      const classified = classifyRecipients(value);
      addIncoming(classified.valid, classified.invalid);
      setDraft("");
    }
  };

  const handleCommitDraft = () => {
    if (draft.trim().length === 0) {
      return;
    }
    const classified = classifyRecipients(draft);
    addIncoming(classified.valid, classified.invalid);
    setDraft("");
  };

  const handlePasteText = (value: string) => {
    const emails = extractEmails(value);
    addIncoming(emails, []);
    setDraft("");
    setNotice(`Added ${emails.length} email${emails.length === 1 ? "" : "s"} from paste.`);
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((current) => current.filter((item) => item !== email));
  };

  const handleClearRecipients = () => {
    setRecipients([]);
    setInvalid([]);
  };

  const handleBulkTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBulkText(event.target.value);
  };

  const handleToggleBulk = () => {
    setBulkOpen((open) => !open);
  };

  const handleAddBulkList = () => {
    const emails = extractEmails(bulkText);
    if (emails.length === 0) {
      setError("No valid emails found in that list.");
      return;
    }
    addIncoming(emails, []);
    setBulkText("");
    setBulkOpen(false);
    setError(null);
    setNotice(`Added ${emails.length} recipient${emails.length === 1 ? "" : "s"}.`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    const text = await file.text();
    const emails = extractEmails(text);
    if (emails.length === 0) {
      setError("No email addresses found in that file.");
      return;
    }
    addIncoming(emails, []);
    setError(null);
    setNotice(`Imported ${emails.length} recipient${emails.length === 1 ? "" : "s"} from ${file.name}.`);
  };

  const handleProgress = (done: number, total: number) => {
    setProgress({ done, total });
    setNotice(`Sending ${done} of ${total}…`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSummary(null);
    const extra = classifyRecipients(draft);
    const fromBulk = extractEmails(bulkText);
    const nextRecipients = mergeRecipients(recipients, [...extra.valid, ...fromBulk]);
    if (!session) {
      setError("Add SMTP details before sending.");
      return;
    }
    if (nextRecipients.length === 0) {
      setError("Add at least one valid recipient email.");
      return;
    }
    setRecipients(nextRecipients);
    setDraft("");
    setIsSending(true);
    setNotice(`Sending 0 of ${nextRecipients.length}…`);
    setProgress({ done: 0, total: nextRecipients.length });
    try {
      const result = await sendBulkMail({
        smtp: toSmtpPayload(session),
        subject,
        body,
        recipients: nextRecipients,
        onProgress: handleProgress,
      });
      setSummary(result);
      setNotice(`Finished ${result.sentCount} sent, ${result.failedCount} failed, of ${nextRecipients.length}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Send failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="compose-page">
      <div className="compose-intro">
        <h2>New message</h2>
        <p>Write it like any mail app. Paste or import as many addresses as you need.</p>
      </div>
      <StatusBanner tone="error" message={error} />
      <StatusBanner tone="ok" message={notice} />
      <form className="mail-window" onSubmit={handleSubmit}>
        <div className="mail-toolbar">
          <button className="btn btn-primary" type="submit" disabled={isSending || !canSend}>
            {isSending ? `Sending ${progress.done}/${progress.total}` : "Send"}
          </button>
          <button className="btn btn-ghost mail-btn" type="button" onClick={handleToggleBulk}>
            Add many
          </button>
          <button className="btn btn-ghost mail-btn" type="button" onClick={handleImportClick}>
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            className="file-hidden"
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
          />
          {!session && (
            <Link className="btn btn-ghost mail-btn" to="/providers">
              SMTP
            </Link>
          )}
        </div>
        {isSending && <SendProgress done={progress.done} total={progress.total} />}
        <div className="mail-row">
          <span className="mail-label">From</span>
          <div className="mail-from">
            <strong>{fromLine}</strong>
            <Link className="mail-link" to="/providers">
              {session ? "Change" : "Set up"}
            </Link>
          </div>
        </div>
        <div className="mail-row">
          <span className="mail-label">To</span>
          <RecipientChips
            recipients={recipients}
            draft={draft}
            invalid={invalid}
            onDraftChange={handleDraftChange}
            onCommitDraft={handleCommitDraft}
            onPasteText={handlePasteText}
            onRemove={handleRemoveRecipient}
            onClear={handleClearRecipients}
          />
        </div>
        {bulkOpen && (
          <div className="mail-row bulk-row">
            <span className="mail-label">List</span>
            <div>
              <textarea
                className="bulk-area"
                value={bulkText}
                onChange={handleBulkTextChange}
                placeholder={"Paste up to 500+ emails, one per line or separated by commas"}
              />
              <div className="actions">
                <button className="btn btn-primary" type="button" onClick={handleAddBulkList}>
                  Add to To
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mail-row">
          <span className="mail-label">Subject</span>
          <input className="mail-plain" value={subject} onChange={handleSubjectChange} required />
        </div>
        <div className="mail-body-wrap">
          <textarea className="mail-body" value={body} onChange={handleBodyChange} required />
        </div>
      </form>
      {summary && (
        <div className="card stack-gap">
          <h3>Delivery</h3>
          <p className="meta">
            {summary.sentCount} sent · {summary.failedCount} failed
          </p>
          {summary.failures.slice(0, 12).map((failure) => (
            <p key={`${failure.email}-${failure.error}`} className="meta">
              {failure.email}: {failure.error}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};
