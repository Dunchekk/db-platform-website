export const YOOKASSA_REQUEST_TIMEOUT_MS = 15_000;

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}
