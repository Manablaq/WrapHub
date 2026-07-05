export const ZERO_ENCRYPTED_HANDLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export function isZeroHandle(handle: string | null | undefined) {
  return typeof handle === "string" && /^0x0{64}$/i.test(handle);
}
