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
