import type { NextFunction, Request, Response } from "express";
import { getPublicKeyBase64, openSealedAuth } from "../services/payload-crypto.js";
import { mailerService } from "../services/mailer-service.js";
import { sendService } from "../services/send-service.js";
import { publicSmtpSchema, sendMailSchema } from "../validation/schemas.js";
import type { SmtpConfig } from "../domain/types.js";

export class MailController {
  getPublicKey(_request: Request, response: Response): void {
    response.json({ data: { publicKey: getPublicKeyBase64() } });
  }

  async testSmtp(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input = publicSmtpSchema.parse(request.body);
      const smtp = toSmtpConfig(input);
      await mailerService.verify(smtp);
      response.json({ data: { ok: true } });
    } catch (error) {
      next(error);
    }
  }

  async send(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const input = sendMailSchema.parse(request.body);
      const smtp = toSmtpConfig(input.smtp);
      const summary = await sendService.sendBulk({
        smtp,
        subject: input.subject,
        letter: input.letter,
        recipients: input.recipients,
      });
      response.json({ data: summary });
    } catch (error) {
      next(error);
    }
  }
}

const toSmtpConfig = (input: {
  host: string;
  port: number;
  secure: boolean;
  fromEmail: string;
  fromName: string;
  auth: { wrappedKey: string; iv: string; ciphertext: string };
}): SmtpConfig => {
  const auth = openSealedAuth(input.auth);
  return {
    host: input.host,
    port: input.port,
    secure: input.secure,
    fromEmail: input.fromEmail,
    fromName: input.fromName,
    username: auth.username,
    password: auth.password,
  };
};

export const mailController = new MailController();
