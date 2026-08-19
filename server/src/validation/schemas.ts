import { z } from "zod";
import { sealedAuthSchema } from "../services/payload-crypto.js";

export const publicSmtpSchema = z.object({
  host: z.string().trim().min(1).max(255),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean(),
  fromEmail: z.string().trim().email(),
  fromName: z.string().trim().min(1).max(80),
  auth: sealedAuthSchema,
});

export const sendMailSchema = z.object({
  smtp: publicSmtpSchema,
  subject: z.string().trim().min(1).max(200),
  letter: z.object({
    body: z.string().trim().min(1).max(20_000),
  }),
  recipients: z.array(z.string()).min(1).max(5000),
});

export type PublicSmtpInput = z.infer<typeof publicSmtpSchema>;
export type SendMailInput = z.infer<typeof sendMailSchema>;
