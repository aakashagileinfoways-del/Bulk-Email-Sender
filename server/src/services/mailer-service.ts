import nodemailer from "nodemailer";
import type { SendResult, SmtpConfig } from "../domain/types.js";
import { HttpError } from "../utils/http-error.js";
import { safeErrorMessage } from "../utils/secrets.js";

export const SMTP_BLOCKED_MESSAGE =
  "Could not reach Gmail SMTP from the API host. Render free web services block outbound ports 25, 465, and 587. Upgrade the Render API to a paid instance, run npm run dev locally, or host the API on a VM/Fly.io that allows SMTP.";

const isSmtpUnreachable = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  const code = "code" in error ? String(error.code) : "";
  const message = error.message.toLowerCase();
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNECTION" ||
    code === "ESOCKET" ||
    code === "ENETUNREACH" ||
    message.includes("timeout") ||
    message.includes("greeting never received")
  );
};

export class MailerService {
  createTransport(smtp: SmtpConfig) {
    const secure = smtp.secure || smtp.port === 465;
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure,
      requireTLS: smtp.port === 587,
      pool: true,
      maxConnections: 1,
      maxMessages: 200,
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 60_000,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
    });
  }

  async verify(smtp: SmtpConfig): Promise<void> {
    const transport = this.createTransport(smtp);
    try {
      await transport.verify();
    } catch (error) {
      if (isSmtpUnreachable(error)) {
        throw new HttpError(400, SMTP_BLOCKED_MESSAGE);
      }
      throw new HttpError(400, safeErrorMessage(error, [smtp.password, smtp.username]));
    } finally {
      transport.close();
    }
  }

  async sendOne(
    smtp: SmtpConfig,
    options: { to: string; subject: string; html: string; text: string },
    transport = this.createTransport(smtp),
  ): Promise<SendResult> {
    try {
      await transport.sendMail({
        from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return { email: options.to, success: true };
    } catch (error) {
      return {
        email: options.to,
        success: false,
        error: isSmtpUnreachable(error)
          ? "SMTP is connected, but this message timed out while sending. Retry this address; Gmail often drops several sends at once."
          : safeErrorMessage(error, [smtp.password]),
      };
    }
  }
}

export const mailerService = new MailerService();
