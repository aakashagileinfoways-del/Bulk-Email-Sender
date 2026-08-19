import type { ApiError } from "../types/models";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const parseError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiError;
    return payload.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

export const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
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
};
