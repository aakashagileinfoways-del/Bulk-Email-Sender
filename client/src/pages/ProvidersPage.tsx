import { type ChangeEvent, type FormEvent, useState } from "react";
import { StatusBanner } from "../components/ui/StatusBanner";
import { useSmtpSession } from "../context/smtp-session-context";
import { mailApi } from "../services/mail-api";
import type { SmtpSession } from "../types/models";
import { smtpFingerprint, toSmtpPayload } from "../utils/smtp";

const emptyForm: SmtpSession = {
  name: "",
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromEmail: "",
  fromName: "",
};

export const ProvidersPage = () => {
  const { session, setSession, clearSession } = useSmtpSession();
  const [form, setForm] = useState<SmtpSession>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [verifiedFingerprint, setVerifiedFingerprint] = useState<string | null>(null);

  const updateField = (field: keyof SmtpSession) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === "port" ? Number(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSecureChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, secure: event.target.checked }));
  };

  const resolveDraft = (): SmtpSession | null => {
    const canReusePassword = Boolean(
      session &&
        form.host === session.host &&
        form.port === session.port &&
        form.secure === session.secure &&
        form.username === session.username &&
        form.fromEmail === session.fromEmail,
    );
    const password = form.password || (canReusePassword && session ? session.password : "");
    if (!form.host || !form.username || !form.fromEmail || !form.fromName || !password) {
      return null;
    }
    return { ...form, password };
  };

  const draft = resolveDraft();
  const canUseAccount = Boolean(draft && verifiedFingerprint === smtpFingerprint(draft));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!draft || !canUseAccount) {
      setError("Test the connection first. Use this account stays off until the test succeeds.");
      return;
    }
    setSession(draft);
    setForm((current) => ({ ...current, password: "" }));
    setNotice("SMTP is ready to send. Details stay in this browser tab only.");
  };

  const handleClear = () => {
    setForm(emptyForm);
    setVerifiedFingerprint(null);
    clearSession();
    setNotice("Session SMTP details were removed from memory.");
  };

  const handleTest = async () => {
    setError(null);
    setNotice(null);
    setVerifiedFingerprint(null);
    if (!draft) {
      setError("Fill host, username, password, from name, and from email, then test.");
      return;
    }
    setIsTesting(true);
    try {
      await mailApi.testSmtp(toSmtpPayload(draft));
      setVerifiedFingerprint(smtpFingerprint(draft));
      setNotice("Connection works. You can now use this account.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "SMTP test failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Sending account</h2>
          <p>
            Username and password are encrypted in the browser before the request is sent. They are not stored
            on the server. After you send, they are dropped from memory on the API.
          </p>
        </div>
      </div>
      <StatusBanner tone="error" message={error} />
      <StatusBanner tone="ok" message={notice} />
      <div className="grid-2">
        <form className="card" onSubmit={handleSubmit} autoComplete="off">
          <h3>Account</h3>
          <label>
            Label
            <input value={form.name} onChange={updateField("name")} placeholder="Work mailbox" required />
          </label>
          <div className="row">
            <label>
              SMTP host
              <input value={form.host} onChange={updateField("host")} placeholder="smtp.gmail.com" required />
            </label>
            <label>
              Port
              <input type="number" value={form.port} onChange={updateField("port")} required />
            </label>
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={form.secure} onChange={handleSecureChange} />
            Use TLS (port 465)
          </label>
          <div className="row">
            <label>
              Username
              <input value={form.username} onChange={updateField("username")} autoComplete="off" required />
            </label>
            <label>
              Password / app password
              <input
                type="password"
                value={form.password}
                onChange={updateField("password")}
                autoComplete="new-password"
                required={!session}
                placeholder={session ? "Re-enter only if you need to replace it" : ""}
              />
            </label>
          </div>
          <div className="row">
            <label>
              From email
              <input type="email" value={form.fromEmail} onChange={updateField("fromEmail")} required />
            </label>
            <label>
              From name
              <input value={form.fromName} onChange={updateField("fromName")} required />
            </label>
          </div>
          <p className="hint">
            Test connection first. Use this account stays disabled until that test succeeds. If you change any
            field after a successful test, you must test again.
          </p>
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={handleTest} disabled={isTesting}>
              {isTesting ? "Testing…" : "Test connection"}
            </button>
            <button className="btn btn-primary" type="submit" disabled={!canUseAccount}>
              Use this account
            </button>
            <button className="btn btn-danger" type="button" onClick={handleClear}>
              Forget now
            </button>
          </div>
        </form>
        <div className="card">
          <h3>Active session</h3>
          {!session && <div className="empty">No SMTP session yet. The password is never shown here.</div>}
          {session && (
            <article className="list-item">
              <div>
                <strong>{session.name}</strong>
                <span className="meta">
                  {session.host}:{session.port} · {session.fromEmail}
                </span>
                <span className="meta">Password: held in memory only (hidden)</span>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
