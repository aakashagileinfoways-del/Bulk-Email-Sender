import type { ApiError } from "../types/models";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 55_000;

const parseError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiError;
    return payload.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (response.status === 204) {
      return undefined as T;
    }
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const payload = (await response.json()) as { data: T };
    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Send timed out. Render may still be waking up, or Gmail SMTP is blocked from the server. Wait 30 seconds and try one test address.",
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
};
