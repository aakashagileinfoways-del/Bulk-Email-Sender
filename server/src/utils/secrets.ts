export const redactSecrets = (message: string, secrets: string[]): string => {
  let redacted = message;
  for (const secret of secrets) {
    if (secret.length === 0) {
      continue;
    }
    redacted = redacted.split(secret).join("[redacted]");
  }
  return redacted;
};

export const safeErrorMessage = (error: unknown, secrets: string[] = []): string => {
  const raw = error instanceof Error ? error.message : "Unexpected server error";
  return redactSecrets(raw, secrets);
};
