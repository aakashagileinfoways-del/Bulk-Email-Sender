import type { SendSummary, SmtpConfig } from "../domain/types.js";
import { HttpError } from "../utils/http-error.js";
import { isValidEmail, parseRecipientList } from "../utils/email.js";
import { buildFormalEmailHtml, buildFormalEmailText } from "../utils/letter-template.js";
import { mailerService } from "./mailer-service.js";

type LetterInput = {
  body: string;
};

export class SendService {
  async sendBulk(options: {
    smtp: SmtpConfig;
    subject: string;
    letter: LetterInput;
    recipients: string[];
  }): Promise<SendSummary> {
    const recipients = parseRecipientList(options.recipients);
    const invalid = recipients.filter((email) => !isValidEmail(email));
    if (invalid.length > 0) {
      throw new HttpError(400, `Invalid recipient addresses: ${invalid.slice(0, 5).join(", ")}`);
    }
    if (recipients.length === 0) {
      throw new HttpError(400, "Add at least one recipient.");
    }

    const html = buildFormalEmailHtml(options.letter.body);
    const text = buildFormalEmailText(options.letter.body);

    const summary: SendSummary = {
      sentCount: 0,
      failedCount: 0,
      failures: [],
    };
    const transport = mailerService.createTransport(options.smtp);
    try {
      for (const email of recipients) {
        const result = await mailerService.sendOne(
          options.smtp,
          {
            to: email,
            subject: options.subject,
            html,
            text,
          },
          transport,
        );
        if (result.success) {
          summary.sentCount += 1;
          continue;
        }
        summary.failedCount += 1;
        summary.failures.push({
          email: result.email,
          error: result.error ?? "Send failed",
        });
      }
    } finally {
      transport.close();
    }
    return summary;
  }
}

export const sendService = new SendService();
