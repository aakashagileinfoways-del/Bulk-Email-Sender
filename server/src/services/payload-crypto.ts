import { constants, createDecipheriv, generateKeyPairSync, privateDecrypt } from "node:crypto";
import { z } from "zod";
import { HttpError } from "../utils/http-error.js";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "der" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

export const sealedAuthSchema = z.object({
  wrappedKey: z.string().min(1).max(4096),
  iv: z.string().min(1).max(64),
  ciphertext: z.string().min(1).max(8192),
});

export type SealedAuth = z.infer<typeof sealedAuthSchema>;

export type SmtpAuth = {
  username: string;
  password: string;
};

const authSchema = z.object({
  username: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(512),
});

export const getPublicKeyBase64 = (): string => Buffer.from(publicKey).toString("base64");

export const openSealedAuth = (sealed: SealedAuth): SmtpAuth => {
  try {
    const aesKey = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(sealed.wrappedKey, "base64"),
    );
    const packed = Buffer.from(sealed.ciphertext, "base64");
    if (packed.length < 17) {
      throw new Error("Invalid sealed auth.");
    }
    const data = packed.subarray(0, packed.length - 16);
    const tag = packed.subarray(packed.length - 16);
    const decipher = createDecipheriv("aes-256-gcm", aesKey, Buffer.from(sealed.iv, "base64"));
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
    return authSchema.parse(JSON.parse(json));
  } catch {
    throw new HttpError(400, "Could not read sealed SMTP credentials.");
  }
};
