# WrapHub

WrapHub is a Sepolia-first Confidential Wrapper Registry App for the Zama Developer Program Bounty Track. Phase 1 focuses on registry discovery, metadata enrichment, UX, validation, and production-ready project structure. It does not deploy custom wrappers or fake registries.

## Official Registry

- Sepolia registry: `0x2f0750Bbb0A246059d80e94c454586a7F27a128e`
- Source of truth: `getTokenConfidentialTokenPairs` on the official registry contract
- Local metadata: display enrichment and safety fallback only

## Phase 1 Scope

- Next.js app with TypeScript
- RainbowKit/wagmi wallet connection
- Sepolia-only wallet/network configuration
- Dark landing page and registry explorer
- Live official registry read for ERC-20 to ERC-7984 pairs
- Known-pair metadata enrichment from `lib/tokens/known-pairs.ts`
- Pair cards with symbol, name, wrapper address, underlying address, validity, faucet support, copy actions, and Etherscan links
- Filters for all pairs, valid only, faucet-supported, restricted, and unknown/revoked
- Registry health panel
- Developer mode registry read snippet

## Architecture

- `app/`: Next.js App Router pages, layout, and global styles
- `components/layout/`: app providers, header, wallet/network UI
- `components/registry/`: registry explorer, pair cards, health panel, developer snippet
- `hooks/`: client hooks for registry reads
- `lib/contracts/`: official registry ABI and ERC-20 metadata ABI
- `lib/registry/`: pair enrichment, filters, health metrics, snippets, typed models
- `lib/tokens/`: known official Sepolia pair metadata

## Local Setup

```bash
npm install
npm run dev
```

Optional WalletConnect project ID:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id npm run dev
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm run build
```

## Official Known Sepolia Pairs

| Symbol | Wrapper | Underlying | Faucet |
| --- | --- | --- | --- |
| cUSDCMock | `0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639` | `0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF` | Public |
| cUSDTMock | `0x4E7B06D78965594eB5EF5414c357ca21E1554491` | `0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0` | Public |
| cWETHMock | `0x46208622DA27d91db4f0393733C8BA082ed83158` | `0xff54739b16576FA5402F211D0b938469Ab9A5f3F` | Public |
| cBRONMock | `0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891` | `0xFf021fB13cA64e5354c62c954b949a88cfDEb25E` | Public |
| cZAMAMock | `0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB` | `0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57` | Public |
| ctGBPMock | `0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC` | `0x93c931278A2aad1916783F952f94276eA5111442` | Public |
| cXAUtMock | `0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7` | `0x24377AE4AA0C45ecEe71225007f17c5D423dd940` | Public |
| ctGBP | `0x167DC962808B32CFFFc7e14B5018c0bE06A3A208` | `0xf6Ef9ADB61A48E29E36bc873070A46A3D2667ff3` | Restricted |

## Bounty Checklist

- [x] Surface every ERC-20 to ERC-7984 wrapper pair returned by the official Sepolia registry
- [x] Add known-pair metadata enrichment without replacing the registry source of truth
- [x] Add Sepolia-only network guard and wallet connection
- [x] Add explorer filters, pair cards, health metrics, copy buttons, and Etherscan links
- [x] Add developer read snippet
- [ ] Implement wrap transaction flow
- [ ] Implement unwrap transaction flow
- [ ] Implement EIP-712 user-decryption flow
- [ ] Implement Sepolia faucet for official public cTokenMocks
