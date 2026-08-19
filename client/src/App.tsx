import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { SmtpSessionProvider } from "./context/smtp-session-context";
import { ComposePage } from "./pages/ComposePage";
import { ProvidersPage } from "./pages/ProvidersPage";

export const App = () => (
  <SmtpSessionProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<ComposePage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </SmtpSessionProvider>
);
