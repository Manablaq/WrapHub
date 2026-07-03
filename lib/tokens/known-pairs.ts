import type { Address } from "viem";

export type KnownPairMetadata = {
  symbol: string;
  name: string;
  wrapperAddress: Address;
  underlyingAddress: Address;
  hasPublicFaucet: boolean;
  mintAccess: "public" | "restricted";
  source: "zama-protocol-apps";
};

export const knownPairs = [
  {
    symbol: "cUSDCMock",
    name: "Confidential USDC Mock",
    wrapperAddress: "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639",
    underlyingAddress: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "cUSDTMock",
    name: "Confidential USDT Mock",
    wrapperAddress: "0x4E7B06D78965594eB5EF5414c357ca21E1554491",
    underlyingAddress: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "cWETHMock",
    name: "Confidential WETH Mock",
    wrapperAddress: "0x46208622DA27d91db4f0393733C8BA082ed83158",
    underlyingAddress: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "cBRONMock",
    name: "Confidential BRON Mock",
    wrapperAddress: "0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891",
    underlyingAddress: "0xFf021fB13cA64e5354c62c954b949a88cfDEb25E",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "cZAMAMock",
    name: "Confidential ZAMA Mock",
    wrapperAddress: "0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB",
    underlyingAddress: "0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "ctGBPMock",
    name: "Confidential Test GBP Mock",
    wrapperAddress: "0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC",
    underlyingAddress: "0x93c931278A2aad1916783F952f94276eA5111442",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "cXAUtMock",
    name: "Confidential XAUt Mock",
    wrapperAddress: "0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7",
    underlyingAddress: "0x24377AE4AA0C45ecEe71225007f17c5D423dd940",
    hasPublicFaucet: true,
    mintAccess: "public",
    source: "zama-protocol-apps",
  },
  {
    symbol: "ctGBP",
    name: "Confidential Test GBP",
    wrapperAddress: "0x167DC962808B32CFFFc7e14B5018c0bE06A3A208",
    underlyingAddress: "0xf6Ef9ADB61A48E29E36bc873070A46A3D2667ff3",
    hasPublicFaucet: false,
    mintAccess: "restricted",
    source: "zama-protocol-apps",
  },
] as const satisfies readonly KnownPairMetadata[];

const pairKey = (underlying: Address, wrapper: Address) =>
  `${underlying.toLowerCase()}:${wrapper.toLowerCase()}`;

export const knownPairByRegistryKey = new Map(
  knownPairs.map((pair) => [pairKey(pair.underlyingAddress, pair.wrapperAddress), pair]),
);

export function getKnownPair(underlyingAddress: Address, wrapperAddress: Address) {
  return knownPairByRegistryKey.get(pairKey(underlyingAddress, wrapperAddress));
}
