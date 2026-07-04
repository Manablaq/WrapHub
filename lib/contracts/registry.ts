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
          { name: "tokenAddress", type: "address" },
          { name: "confidentialTokenAddress", type: "address" },
          { name: "isValid", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getConfidentialTokenAddress",
    stateMutability: "view",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [
      { name: "", type: "bool" },
      { name: "", type: "address" },
    ],
  },
  {
    type: "function",
    name: "getTokenAddress",
    stateMutability: "view",
    inputs: [{ name: "confidentialTokenAddress", type: "address" }],
    outputs: [
      { name: "", type: "bool" },
      { name: "", type: "address" },
    ],
  },
  {
    type: "function",
    name: "isConfidentialTokenValid",
    stateMutability: "view",
    inputs: [{ name: "confidentialTokenAddress", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type RegistryPair = {
  tokenAddress: Address;
  confidentialTokenAddress: Address;
  isValid?: boolean;
  token?: Address;
  confidentialToken?: Address;
};
