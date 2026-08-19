import nodemailer from "nodemailer";
import type { SendResult, SmtpConfig } from "../domain/types.js";
import { HttpError } from "../utils/http-error.js";
import { safeErrorMessage } from "../utils/secrets.js";

export class MailerService {
  createTransport(smtp: SmtpConfig) {
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
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
        error: safeErrorMessage(error, [smtp.password]),
      };
    }
  }
}

export const mailerService = new MailerService();
