export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export type SendResult = {
  email: string;
  success: boolean;
  error?: string;
};

export type SendSummary = {
  sentCount: number;
  failedCount: number;
  failures: Array<{ email: string; error: string }>;
};
