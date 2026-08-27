export type BackoffOptions = {
  baseMs?: number;
  maxMs?: number;
  factor?: number;
  jitter?: number;
  maxAttempts?: number;
};

export function exponentialDelay(attempt: number, opts: BackoffOptions = {}): number {
  const base = opts.baseMs ?? 400;
  const max = opts.maxMs ?? 12_000;
  const factor = opts.factor ?? 2;
  const jitter = opts.jitter ?? 0.25;
  const exp = Math.min(max, base * factor ** Math.max(0, attempt));
  const spread = exp * jitter;
  return Math.round(exp - spread + Math.random() * spread * 2);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withBackoff<T>(
  task: (attempt: number) => Promise<T>,
  opts: BackoffOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 5;
  let last: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await task(attempt);
    } catch (err) {
      last = err;
      if (attempt >= maxAttempts - 1) break;
      await sleep(exponentialDelay(attempt, opts));
    }
  }
  throw last instanceof Error ? last : new Error("retry failed");
}
