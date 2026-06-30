export function shouldMarkProviderUnknown(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("socket") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  );
}
