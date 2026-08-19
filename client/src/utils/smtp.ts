import type { SmtpSession } from "../types/models";

export const toSmtpPayload = (session: SmtpSession) => ({
  host: session.host,
  port: session.port,
  secure: session.secure,
  username: session.username,
  password: session.password,
  fromEmail: session.fromEmail,
  fromName: session.fromName,
});

export const toPublicSmtp = (session: Omit<SmtpSession, "name">) => ({
  host: session.host,
  port: session.port,
  secure: session.secure,
  fromEmail: session.fromEmail,
  fromName: session.fromName,
});

export const smtpFingerprint = (session: SmtpSession): string =>
  JSON.stringify({
    host: session.host.trim(),
    port: session.port,
    secure: session.secure,
    username: session.username.trim(),
    password: session.password,
    fromEmail: session.fromEmail.trim(),
    fromName: session.fromName.trim(),
  });
