/**
 * TaskFlow — Typed fetch helper for the internal REST API.
 * Throws a descriptive Error when the server responds with !ok.
 * Developed by Brijesh Mishra
 */

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (data as { error?: string }).error ?? "Something went wrong";
    throw new Error(message);
  }

  return data as T;
}
