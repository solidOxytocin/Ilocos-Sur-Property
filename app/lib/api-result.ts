import { Platform } from "react-native";

/** Machine-oriented codes; pair with `userMessage` for UI. */
export type ApiErrorCode =
  | "offline"
  | "network"
  | "timeout"
  | "http"
  | "empty_body"
  | "not_found"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "bad_request"
  | "parse"
  | "unknown";

export type ApiFailure = {
  code: ApiErrorCode;
  /** User-facing, uniform copy */
  message: string;
  status?: number;
  retryable: boolean;
};

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: ApiFailure };
export type ApiResult<T> = ApiSuccess<T> | ApiErr;

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Uniform user-facing strings (admin + public). */
export const API_USER_MESSAGES = {
  offline:
    "You appear to be offline. Connect to the internet and try again.",
  network:
    "We could not reach the server. Check your connection and try again.",
  timeout: "The request took too long. Please try again.",
  server:
    "Something went wrong on our side. Please try again in a moment.",
  http: "The server returned an error. Please try again.",
  emptyBody:
    "No data was returned. Please try again or contact support if this continues.",
  notFound:
    "This listing is not available or may have been removed.",
  unauthorized: "Your session expired. Sign in again.",
  forbidden: "You do not have permission to do that.",
  badRequest: "The request could not be processed. Check your input and try again.",
  parse: "We could not read the server response. Please try again.",
  unknown: "Something went wrong. Please try again.",
  emptyList:
    "No properties match your search or filters. Try adjusting filters or clear the search.",
  emptyListAdmin:
    "No listings loaded. Pull to refresh or add a new property when your connection is back.",
  noListings:
    "No listings to show right now. Check back soon or browse all properties.",
} as const;

export function isOnline(): boolean {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && "onLine" in navigator) {
    return navigator.onLine;
  }
  return true;
}

function failure(
  code: ApiErrorCode,
  message: string,
  retryable: boolean,
  status?: number
): ApiFailure {
  return { code, message, retryable, status };
}

export function notFoundFailure(): ApiFailure {
  return failure("not_found", API_USER_MESSAGES.notFound, false);
}

function fromHttpStatus(status: number, bodyMessage?: string): ApiFailure {
  const msg =
    bodyMessage?.trim() ||
    (status === 401
      ? API_USER_MESSAGES.unauthorized
      : status === 403
        ? API_USER_MESSAGES.forbidden
        : status === 404
          ? API_USER_MESSAGES.notFound
          : status >= 500
            ? API_USER_MESSAGES.server
            : API_USER_MESSAGES.http);
  const retryable = status === 408 || status === 429 || status >= 500;
  const code: ApiErrorCode =
    status === 401
      ? "unauthorized"
      : status === 403
        ? "forbidden"
        : status === 404
          ? "not_found"
          : status >= 500
            ? "server"
            : "http";
  return failure(code, msg, retryable, status);
}

/** Infer failure from thrown value (after fetch throws). */
export function classifyThrownError(err: unknown, offlineHint: boolean): ApiFailure {
  if (offlineHint || !isOnline()) {
    return failure("offline", API_USER_MESSAGES.offline, true);
  }
  const name = err && typeof err === "object" && "name" in err ? String((err as Error).name) : "";
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (
    lower.includes("network request failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed")
  ) {
    return failure("network", API_USER_MESSAGES.network, true);
  }
  if (name === "AbortError" || lower.includes("aborted")) {
    return failure("timeout", API_USER_MESSAGES.timeout, true);
  }
  return failure("network", API_USER_MESSAGES.network, true);
}

async function parseJsonBody(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text?.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function messageFromJsonBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const o = body as Record<string, unknown>;
  const m = o.message ?? o.error ?? o.detail;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (Array.isArray(o.errors) && o.errors.length && typeof o.errors[0] === "string") {
    return o.errors[0];
  }
  return undefined;
}

type GetOptions = {
  maxRetries?: number;
  /** When false, skips navigator.onLine short-circuit (e.g. double-check after error). */
  requireOnline?: boolean;
};

/**
 * GET JSON with small exponential backoff retries for transient failures.
 */
export async function fetchGetJson<T>(
  url: string,
  options: GetOptions = {}
): Promise<ApiResult<T>> {
  const maxRetries = options.maxRetries ?? 2;
  const requireOnline = options.requireOnline !== false;

  let lastFail: ApiFailure | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await SLEEP(350 * attempt);
    }

    if (requireOnline && !isOnline()) {
      lastFail = failure("offline", API_USER_MESSAGES.offline, true);
      continue;
    }

    try {
      const response = await fetch(url);
      const body = await parseJsonBody(response);

      if (!response.ok) {
        const msg = messageFromJsonBody(body);
        lastFail = fromHttpStatus(response.status, msg);
        if (!lastFail.retryable) return { ok: false, error: lastFail };
        continue;
      }

      if (body === null || body === undefined) {
        lastFail = failure("empty_body", API_USER_MESSAGES.emptyBody, true);
        continue;
      }

      return { ok: true, data: body as T };
    } catch (e) {
      lastFail = classifyThrownError(e, false);
    }
  }

  return { ok: false, error: lastFail ?? failure("unknown", API_USER_MESSAGES.unknown, true) };
}

/** POST/PUT JSON; single attempt — mutations are not auto-retried here (callers may retry). */
export async function fetchMutationJson<T>(
  url: string,
  init: RequestInit
): Promise<ApiResult<T>> {
  if (!isOnline()) {
    return { ok: false, error: failure("offline", API_USER_MESSAGES.offline, true) };
  }

  try {
    const response = await fetch(url, init);
    const body = await parseJsonBody(response);

    if (!response.ok) {
      const msg = messageFromJsonBody(body);
      return { ok: false, error: fromHttpStatus(response.status, msg) };
    }

    if (body === null || body === undefined) {
      return { ok: false, error: failure("empty_body", API_USER_MESSAGES.emptyBody, true) };
    }

    return { ok: true, data: body as T };
  } catch (e) {
    return { ok: false, error: classifyThrownError(e, false) };
  }
}

/** DELETE or mutation with empty success body */
export async function fetchMutationOk(
  url: string,
  init: RequestInit
): Promise<ApiResult<void>> {
  if (!isOnline()) {
    return { ok: false, error: failure("offline", API_USER_MESSAGES.offline, true) };
  }

  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const body = await parseJsonBody(response);
      const msg = messageFromJsonBody(body);
      return { ok: false, error: fromHttpStatus(response.status, msg) };
    }

    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: classifyThrownError(e, false) };
  }
}

/** FormData upload — response must be JSON */
export async function fetchUploadJson<T>(
  url: string,
  init: RequestInit
): Promise<ApiResult<T>> {
  if (!isOnline()) {
    return { ok: false, error: failure("offline", API_USER_MESSAGES.offline, true) };
  }

  try {
    const response = await fetch(url, init);
    const body = await parseJsonBody(response);

    if (!response.ok) {
      const msg = messageFromJsonBody(body);
      return { ok: false, error: fromHttpStatus(response.status, msg) };
    }

    if (body === null || body === undefined) {
      return { ok: false, error: failure("empty_body", API_USER_MESSAGES.emptyBody, true) };
    }

    return { ok: true, data: body as T };
  } catch (e) {
    return { ok: false, error: classifyThrownError(e, false) };
  }
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function err(f: ApiFailure): ApiErr {
  return { ok: false, error: f };
}

/** Not a screen — satisfies Expo Router when this module sits under `app/`. Prefer `@/lib/api-result` from outside `app/`. */
export default function ApiResultRouteStub(): null {
  return null;
}
