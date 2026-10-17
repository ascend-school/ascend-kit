//
//  http.ts
//  ascend-cloud
//
//  Created by Prakash on 16/10/26.
//

export class AppError extends Error {
  // RPC keeps an error's name, not its class: the UI apps recognise core's errors by it.
  override readonly name = "AppError";
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (m: string) => new AppError(400, "bad_request", m);
/** 401 = your session died. The portal signs out on 401 only, never on 403. */
export const unauthorised = (m = "Please sign in again.") => new AppError(401, "unauthorised", m);
/** 403 = you lack this permission. Never triggers a sign-out. */
export const forbidden = (m = "You do not have access to that.") => new AppError(403, "forbidden", m);
export const notFound = (m = "Not found.") => new AppError(404, "not_found", m);
export const conflict = (m: string) => new AppError(409, "conflict", m);
export const tooMany = (m = "Too many attempts. Try again in a few minutes.") =>
  new AppError(429, "rate_limited", m);
export const paymentRequired = (m: string) => new AppError(402, "plan_limit", m);

export function redirect(location: string, extraHeaders: Record<string, string> = {}): Response {
  return new Response(null, { status: 302, headers: { Location: location, ...extraHeaders } });
}

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}
