import { createContext, useContext, type ReactNode } from "react";
import { useMemo, useState } from "react";
import type { SmtpSession } from "../types/models";

type SmtpSessionContextValue = {
  session: SmtpSession | null;
  setSession: (session: SmtpSession) => void;
  clearSession: () => void;
};

const SmtpSessionContext = createContext<SmtpSessionContextValue | null>(null);

type SmtpSessionProviderProps = {
  children: ReactNode;
};

export const SmtpSessionProvider = ({ children }: SmtpSessionProviderProps) => {
  const [session, setSessionState] = useState<SmtpSession | null>(null);

  const setSession = (next: SmtpSession) => {
    setSessionState(next);
  };

  const clearSession = () => {
    setSessionState(null);
  };

  const value = useMemo(
    () => ({
      session,
      setSession,
      clearSession,
    }),
    [session],
  );

  return <SmtpSessionContext.Provider value={value}>{children}</SmtpSessionContext.Provider>;
};

export const useSmtpSession = (): SmtpSessionContextValue => {
  const value = useContext(SmtpSessionContext);
  if (!value) {
    throw new Error("useSmtpSession must be used inside SmtpSessionProvider.");
  }
  return value;
};
