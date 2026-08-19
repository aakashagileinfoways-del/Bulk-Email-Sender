const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_FIND = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export const MAX_RECIPIENTS = 2000;
export const SEND_CHUNK_SIZE = 1;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim().toLowerCase());

export const parseRecipientTokens = (raw: string): string[] =>
  raw
    .split(/[\s,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

export const classifyRecipients = (raw: string): { valid: string[]; invalid: string[] } => {
  const uniqueValid = new Set<string>();
  const uniqueInvalid = new Set<string>();
  for (const token of parseRecipientTokens(raw)) {
    if (isValidEmail(token)) {
      uniqueValid.add(token);
    } else {
      uniqueInvalid.add(token);
    }
  }
  return {
    valid: [...uniqueValid],
    invalid: [...uniqueInvalid],
  };
};

export const extractEmails = (raw: string): string[] => {
  const matches = raw.match(EMAIL_FIND) ?? [];
  return [...new Set(matches.map((item) => item.toLowerCase()).filter(isValidEmail))];
};

export const mergeRecipients = (current: string[], incoming: string[]): string[] =>
  [...new Set([...current, ...incoming])].slice(0, MAX_RECIPIENTS);

export const chunkRecipients = (recipients: string[], size: number): string[][] => {
  const groups: string[][] = [];
  for (let index = 0; index < recipients.length; index += size) {
    groups.push(recipients.slice(index, index + size));
  }
  return groups;
};
