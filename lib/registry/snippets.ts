import { OFFICIAL_REGISTRY_ADDRESS } from "@/lib/contracts/registry";

export const registryReadSnippet = `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { registryAbi } from "@/lib/contracts/registry";

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const pairs = await client.readContract({
  address: "${OFFICIAL_REGISTRY_ADDRESS}",
  abi: registryAbi,
  functionName: "getTokenConfidentialTokenPairs",
});`;
