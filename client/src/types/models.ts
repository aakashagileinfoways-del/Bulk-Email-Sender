export type SmtpSession = {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export type SendSummary = {
  sentCount: number;
  failedCount: number;
  failures: Array<{ email: string; error: string }>;
};

export type ApiError = {
  error: string;
};
