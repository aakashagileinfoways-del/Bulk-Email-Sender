import { type ChangeEvent, type FormEvent, useState } from "react";
import { StatusBanner } from "../components/ui/StatusBanner";
import { useSmtpSession } from "../context/smtp-session-context";
import { mailApi } from "../services/mail-api";
import type { SmtpSession } from "../types/models";
import { toSmtpPayload } from "../utils/smtp";

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

  const updateField = (field: keyof SmtpSession) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === "port" ? Number(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSecureChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, secure: event.target.checked }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const password = form.password || session?.password || "";
    if (!password) {
      setError("SMTP password is required.");
      return;
    }
    setSession({ ...form, password });
    setForm((current) => ({ ...current, password: "" }));
    setNotice("SMTP details are held in this browser tab only. The password is not stored on the server.");
  };

  const handleClear = () => {
    setForm(emptyForm);
    clearSession();
    setNotice("Session SMTP details were removed from memory.");
  };

  const handleTest = async () => {
    setError(null);
    setNotice(null);
    const smtp = session && !form.password ? session : form;
    if (!smtp.host || !smtp.password) {
      setError("Enter the SMTP password to test the connection.");
      return;
    }
    setIsTesting(true);
    try {
      await mailApi.testSmtp(toSmtpPayload(smtp));
      setNotice("SMTP connection verified. Password was not saved.");
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
            Network inspector will show ciphertext for username and password, not the real secret. This tab still
            keeps the password in memory until you close it or press Forget now. Revoke any app password that was
            previously sent in plain text.
          </p>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Use this account
            </button>
            <button className="btn btn-ghost" type="button" onClick={handleTest} disabled={isTesting}>
              {isTesting ? "Testing…" : "Test connection"}
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
