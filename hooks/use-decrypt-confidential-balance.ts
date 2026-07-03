"use client";

import { useGrantPermit, useHasPermit, useDecryptValues } from "@zama-fhe/react-sdk";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";

export function useDecryptConfidentialBalance({
  wrapperAddress,
  handle,
}: {
  wrapperAddress: Address;
  handle?: `0x${string}`;
}) {
  const [decryptRequested, setDecryptRequested] = useState(false);
  const [lastDecryptedAt, setLastDecryptedAt] = useState<Date | null>(null);
  const hasPermit = useHasPermit(
    { contractAddresses: [wrapperAddress] },
    { enabled: Boolean(wrapperAddress) },
  );
  const grantPermit = useGrantPermit();

  const encryptedInputs = useMemo(
    () => (handle ? [{ encryptedValue: handle, contractAddress: wrapperAddress }] : []),
    [handle, wrapperAddress],
  );

  const decryptQuery = useDecryptValues(encryptedInputs, {
    enabled: decryptRequested && Boolean(handle) && hasPermit.data === true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const decryptedValue = handle && decryptQuery.data ? decryptQuery.data[handle] : undefined;

  useEffect(() => {
    if (decryptedValue !== undefined) {
      setLastDecryptedAt(new Date());
    }
  }, [decryptedValue]);

  async function decrypt() {
    if (!handle) {
      return;
    }

    setDecryptRequested(false);

    if (!hasPermit.data) {
      await grantPermit.mutateAsync([wrapperAddress]);
      await hasPermit.refetch();
    }

    setDecryptRequested(true);
  }

  return {
    decrypt,
    decryptedValue,
    lastDecryptedAt,
    hasPermit: hasPermit.data === true,
    isCheckingPermit: hasPermit.isLoading,
    isGrantingPermit: grantPermit.isPending,
    isDecrypting: decryptQuery.isFetching,
    isSuccess: decryptQuery.isSuccess && decryptedValue !== undefined,
    error: grantPermit.error ?? decryptQuery.error ?? hasPermit.error,
    reset: () => {
      setDecryptRequested(false);
      setLastDecryptedAt(null);
      grantPermit.reset();
    },
  };
}
