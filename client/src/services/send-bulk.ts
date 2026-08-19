import type { SendSummary, SmtpSession } from "../types/models";
import { chunkRecipients, SEND_CHUNK_SIZE } from "../utils/recipients";
import { mailApi } from "./mail-api";

type BulkSendInput = {
  smtp: Omit<SmtpSession, "name">;
  subject: string;
  body: string;
  recipients: string[];
  onProgress: (done: number, total: number) => void;
};

const emptySummary = (): SendSummary => ({
  sentCount: 0,
  failedCount: 0,
  failures: [],
});

export const sendBulkMail = async (input: BulkSendInput): Promise<SendSummary> => {
  const groups = chunkRecipients(input.recipients, SEND_CHUNK_SIZE);
  const total = input.recipients.length;
  const summary = emptySummary();
  let done = 0;

  for (const group of groups) {
    input.onProgress(done, total);
    const result = await mailApi.send({
      smtp: input.smtp,
      subject: input.subject,
      letter: { body: input.body },
      recipients: group,
    });
    summary.sentCount += result.sentCount;
    summary.failedCount += result.failedCount;
    summary.failures.push(...result.failures);
    done += group.length;
    input.onProgress(done, total);
  }

  return summary;
};
