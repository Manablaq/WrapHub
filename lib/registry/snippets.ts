import { SUPPORTED_NETWORKS } from "@/lib/networks/supported-networks";

export const registryReadSnippet = `import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { registryAbi } from "@/lib/contracts/registry";
import { erc20Abi } from "@/lib/contracts/erc20";
import { erc7984Abi } from "@/lib/contracts/erc7984";
import { erc7984Erc20WrapperAbi } from "@/lib/contracts/wrapper";
import { useGrantPermit, useDecryptValues, useUnshield } from "@zama-fhe/react-sdk";

const registries = {
${SUPPORTED_NETWORKS.map((network) => `  ${network.chainId}: "${network.registryAddress}",`).join("\n")}
};

const activeChain = sepolia; // or mainnet
const client = createPublicClient({
  chain: activeChain,
  transport: http(),
});

const pairs = await client.readContract({
  address: registries[activeChain.id],
  abi: registryAbi,
  functionName: "getTokenConfidentialTokenPairs",
});

// Registry discovery diagnostics:
// getTokenConfidentialTokenPairs() returns:
// { tokenAddress, confidentialTokenAddress, isValid }[]
// tokenAddress is the public ERC-20 underlying.
// confidentialTokenAddress is the ERC-7984 wrapper.
// isValid is the registry's active/revoked flag for that pair.
//
// Standalone validation uses:
// isConfidentialTokenValid(confidentialTokenAddress)
//
// WrapHub normalizes addresses by lowercase comparison and checks local metadata
// in both possible orientations. If a known pair ever appears reversed, the UI
// normalizes it back to { underlyingAddress, wrapperAddress } and marks the
// diagnostic flag. Local metadata enriches labels and faucet/restricted status;
// the live registry remains the source of truth and unknown pairs are shown.
// Local custom pairs are appended after official registry results and marked.

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
