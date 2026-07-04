import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

export const registryReadSnippet = `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { registryAbi } from "@/lib/contracts/registry";
import { erc20Abi } from "@/lib/contracts/erc20";
import { erc7984Abi } from "@/lib/contracts/erc7984";
import { erc7984Erc20WrapperAbi } from "@/lib/contracts/wrapper";
import { useGrantPermit, useDecryptValues } from "@zama-fhe/react-sdk";

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const pairs = await client.readContract({
  address: "${OFFICIAL_REGISTRY_ADDRESS}",
  abi: registryAbi,
  functionName: "getTokenConfidentialTokenPairs",
});

// Phase 2 transaction functions:
// ERC-20: balanceOf(address), allowance(address,address), approve(address,uint256)
// Public mocks: mint(address,uint256)
// Official OpenZeppelin confidential wrapper: wrap(address to,uint256 amount)
await walletClient.writeContract({
  address: wrapperAddress,
  abi: erc7984Erc20WrapperAbi,
  functionName: "wrap",
  args: [connectedUserAddress, amount],
});

// Phase 3 confidential balance read + user-decryption:
const encryptedBalanceHandle = await client.readContract({
  address: wrapperAddress,
  abi: erc7984Abi,
  functionName: "confidentialBalanceOf",
  args: [connectedUserAddress],
});

// In React, grantPermit signs the Zama EIP-712 permit for this contract.
// useDecryptValues decrypts locally through the Zama SDK/relayer using:
// [{ encryptedValue: encryptedBalanceHandle, contractAddress: wrapperAddress }]
const grantPermit = useGrantPermit();
await grantPermit.mutateAsync([wrapperAddress]);
const decrypted = useDecryptValues([
  { encryptedValue: encryptedBalanceHandle, contractAddress: wrapperAddress },
]);

// Phase 4 unwrap / unshield:
// OpenZeppelin ERC7984ERC20Wrapper exposes a two-step unwrap:
// 1. unwrap(from, to, externalEuint64 encryptedAmount, bytes inputProof)
// 2. finalizeUnwrap(unwrapRequestId, unwrapAmountCleartext, decryptionProof)
// WrapHub uses @zama-fhe/react-sdk useUnshield(wrapperAddress), which
// encrypts the public amount as euint64, submits unwrap, waits for
// UnwrapRequested, public-decrypts the unwrap amount, and finalizes.
const unshield = useUnshield(wrapperAddress);
unshield.mutate({ amount });`;
