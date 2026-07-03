import type { Address } from "viem";

export const OFFICIAL_REGISTRY_ADDRESS =
  "0x2f0750Bbb0A246059d80e94c454586a7F27a128e" as const satisfies Address;

export const registryAbi = [
  {
    type: "function",
    name: "getTokenConfidentialTokenPairs",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "token", type: "address" },
          { name: "confidentialToken", type: "address" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "isValidTokenConfidentialTokenPair",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "confidentialToken", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type RegistryPair = {
  token: Address;
  confidentialToken: Address;
};
