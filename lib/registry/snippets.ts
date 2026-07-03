import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

export const registryReadSnippet = `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { registryAbi } from "@/lib/contracts/registry";
import { erc20Abi } from "@/lib/contracts/erc20";
import { erc7984Erc20WrapperAbi } from "@/lib/contracts/wrapper";

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
});`;
