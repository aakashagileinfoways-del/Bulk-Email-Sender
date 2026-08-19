type SealedAuth = {
  wrappedKey: string;
  iv: string;
  ciphertext: string;
};

const toBase64 = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  view.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
};

const fromBase64 = (value: string): ArrayBuffer => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

const importPublicKey = async (publicKeyBase64: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "spki",
    fromBase64(publicKeyBase64),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );

export const sealSmtpAuth = async (
  publicKeyBase64: string,
  auth: { username: string; password: string },
): Promise<SealedAuth> => {
  const rsaKey = await importPublicKey(publicKeyBase64);
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(auth));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded);
  const rawAes = await crypto.subtle.exportKey("raw", aesKey);
  const wrappedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAes);
  return {
    wrappedKey: toBase64(wrappedKey),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };
};
