export type FriendlyError = {
  message: string;
  details?: string;
};

export function getFriendlyUserDecryptionError(
  error: Error | null | undefined,
  fallback = "User-decryption failed. Check wallet, network, or relayer connectivity.",
): FriendlyError | null {
  if (!error) {
    return null;
  }

  const rawMessage = error.message || fallback;
  const firstLine = rawMessage.split("\n")[0] ?? fallback;
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes("user rejected")) {
    return { message: "Signature rejected in wallet.", details: rawMessage };
  }

  if (
    (normalized.includes("bad") && normalized.includes("json")) ||
    (normalized.includes("relayer") && normalized.includes("json")) ||
    normalized.includes("did not respond") ||
    normalized.includes("didn't respond")
  ) {
    return {
      message: "Relayer response could not be parsed. Check network connectivity or try again.",
      details: rawMessage,
    };
  }

  if (normalized.includes("relayer") || normalized.includes("decrypt")) {
    return { message: fallback, details: rawMessage };
  }

  return { message: firstLine, details: rawMessage === firstLine ? undefined : rawMessage };
}
