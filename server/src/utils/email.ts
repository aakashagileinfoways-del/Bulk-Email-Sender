const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value);

export const parseRecipientList = (recipients: string[]): string[] => {
  const unique = new Set<string>();
  for (const raw of recipients) {
    const email = normalizeEmail(raw);
    if (email.length === 0) {
      continue;
    }
    unique.add(email);
  }
  return [...unique];
};
  