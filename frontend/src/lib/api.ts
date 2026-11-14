const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

type ApiErrorBody = {
  error?: {
    message?: string;
    details?: unknown;
  };
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiClientError(
      0,
      "Could not reach the DISHA API. Check that the server is running."
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as
    | ApiErrorBody
    | T
    | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;

    throw new ApiClientError(
      response.status,
      errorBody?.error?.message ?? `Request failed (${response.status})`,
      errorBody?.error?.details
    );
  }

  return body as T;
}

export function apiAssetUrl(path?: string | null) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
