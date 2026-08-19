import type { SendSummary, SmtpSession } from "../types/models";
import { requestJson } from "./api-client";
import { sealSmtpAuth } from "../utils/secret-seal";
import { toPublicSmtp } from "../utils/smtp";

type SmtpSecrets = Omit<SmtpSession, "name">;

const fetchPublicKey = () => requestJson<{ publicKey: string }>("/api/crypto/public-key");

const toSealedSmtp = async (smtp: SmtpSecrets) => {
  const { publicKey } = await fetchPublicKey();
  const auth = await sealSmtpAuth(publicKey, {
    username: smtp.username,
    password: smtp.password,
  });
  return {
    ...toPublicSmtp(smtp),
    auth,
  };
};

export const mailApi = {
  testSmtp: async (smtp: SmtpSecrets) =>
    requestJson<{ ok: boolean }>("/api/smtp/test", {
      method: "POST",
      body: JSON.stringify(await toSealedSmtp(smtp)),
    }),
  send: async (payload: {
    smtp: SmtpSecrets;
    subject: string;
    letter: {
      body: string;
    };
    recipients: string[];
  }) =>
    requestJson<SendSummary>("/api/send", {
      method: "POST",
      body: JSON.stringify({
        smtp: await toSealedSmtp(payload.smtp),
        subject: payload.subject,
        letter: payload.letter,
        recipients: payload.recipients,
      }),
    }),
};
