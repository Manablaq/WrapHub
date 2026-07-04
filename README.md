# WrapHub

WrapHub is a Sepolia-first Confidential Wrapper Registry App for the Zama Developer Program Bounty Track. It discovers official Sepolia wrapper pairs, lets users mint official public mocks, approve, wrap, decrypt confidential balances, and unwrap back to ERC-20. It does not deploy custom wrappers or fake registries.

## Official Registry

- Sepolia registry: `0x2f0750Bbb0A246059d80e94c454586a7F27a128e`
- Source of truth: `getTokenConfidentialTokenPairs` on the official registry contract
- Registry return shape: `{ tokenAddress, confidentialTokenAddress, isValid }[]`
- Validation: the list return includes `isValid`; standalone checks use `isConfidentialTokenValid(confidentialTokenAddress)`
- Local metadata: display enrichment only for known symbols, faucet support, and restricted mint labels

## Reviewer Walkthrough

Recommended pair: `cUSDCMock`.

1. Connect a wallet on Sepolia.
2. Find `cUSDCMock` in the Registry Explorer.
3. Enter `0.01` and click `Mint test ERC-20`.
4. Click `Approve wrapper`.
5. Click `Wrap into confidential token`.
6. In Confidential Balance Inspector, click `Decrypt my ERC-7984 balance`.
7. Enter `0.005` and click `Unwrap to ERC-20`.
8. Use Session Activity to inspect submitted and confirmed Sepolia transactions.

Decrypted balances stay local to the browser UI. Transaction history is stored only in browser `localStorage`; there is no backend.

## Implemented Scope

- Next.js app with TypeScript
- RainbowKit/wagmi wallet connection
- Sepolia-only wallet/network configuration
- Dark landing page and registry explorer
- Live official registry read for ERC-20 to ERC-7984 pairs
- Known-pair metadata enrichment from `lib/tokens/known-pairs.ts`
- Pair cards with symbol, name, wrapper address, underlying address, validity, faucet support, copy actions, and Etherscan links
- Filters for all pairs, valid only, faucet-supported, restricted, and unknown/revoked
- Registry health panel
- Registry quality diagnostics for known official, valid, revoked, validation unknown/read failed, public faucet, restricted mint, and unknown/system pairs
- Developer Console registry integration details
- ERC-20 `balanceOf`, `allowance`, and `approve`
- Public mock token `mint(address,uint256)` faucet action
- Official wrapper `wrap(address,uint256)` action
- ERC-7984 encrypted balance handle reads through `confidentialBalanceOf(address)`
- Zama EIP-712 user-decryption for connected-user ERC-7984 balances
- ERC-7984 to ERC-20 unwrap through the official wrapper request/finalize flow

## Wrapper Function

WrapHub uses the OpenZeppelin confidential wrapper interface from `@openzeppelin/confidential-contracts@0.5.1`:

```solidity
function wrap(address to, uint256 amount) external returns (euint64);
```

The UI approves the official wrapper address as spender for the underlying ERC-20, then calls `wrap(connectedUserAddress, amount)` on the wrapper returned by the official Sepolia registry.

## Confidential Balance Decryption

WrapHub reads the encrypted ERC-7984 balance handle with:

```solidity
function confidentialBalanceOf(address account) external view returns (euint64);
```

The frontend uses `@zama-fhe/react-sdk@3.2.0` and `@zama-fhe/sdk@3.2.0`:

- `ZamaProvider` with the wagmi adapter and the official Sepolia Zama relayer config
- `useGrantPermit` to request the EIP-712 wallet signature for the wrapper contract
- `useDecryptValues` to decrypt `{ encryptedValue, contractAddress }`

Decrypted balances are displayed only in browser UI state. WrapHub does not post decrypted balances on-chain and does not store them in a backend.

## Unwrap Flow

OpenZeppelin `@openzeppelin/confidential-contracts@0.5.1` defines ERC7984 ERC-20 wrapper unwrapping as a request/finalize flow:

```solidity
function unwrap(
  address from,
  address to,
  externalEuint64 encryptedAmount,
  bytes calldata inputProof
) external returns (bytes32);

function finalizeUnwrap(
  bytes32 unwrapRequestId,
  uint64 unwrapAmountCleartext,
  bytes calldata decryptionProof
) external;
```

The implementation ABI also includes `unwrap(address from, address to, euint64 amount)` for already-authorized encrypted handles. WrapHub’s amount form uses the encrypted-input path through `@zama-fhe/react-sdk` `useUnshield(wrapperAddress)`, which encrypts the public amount as `euint64`, submits `unwrap`, waits for the `UnwrapRequested` event, public-decrypts the unwrap amount, and submits `finalizeUnwrap`. This is the flow that actually returns underlying ERC-20 to the user.

## Architecture

- `app/`: Next.js App Router pages, layout, and global styles
- `components/layout/`: app providers, header, wallet/network UI
- `components/registry/`: registry explorer, pair cards, health panel, developer snippet
- `hooks/`: client hooks for registry reads, ERC-20 reads, mint, approve, wrap, encrypted balance handle reads, user-decryption, and unwrap
- `lib/contracts/`: official registry ABI, ERC-20 ABI, ERC7984 ABI, and ERC7984 ERC-20 wrapper ABI
- `lib/registry/`: pair normalization, metadata checks, filters, health metrics, snippets, typed models
- `lib/tokens/`: known official Sepolia pair metadata

## Registry Coverage and Labels

The live registry remains the source of truth. WrapHub displays every pair returned by the registry, including unknown, revoked, invalid, placeholder, or system-looking entries. Local known-pair metadata is never used to replace the registry; it only enriches display names and labels.

- `Known official wrapper`: the registry pair matches one of the local official Sepolia metadata entries by normalized lowercase addresses.
- `Public mock faucet`: the underlying ERC-20 is one of the official public cTokenMock underlyings with `mint(address,uint256)` access.
- `Restricted mint`: the pair is known official metadata, but the underlying token does not expose a public test faucet.
- `Registry-returned unknown`: the live registry returned the pair, but WrapHub does not have local official metadata for it.
- `System / placeholder`: one side of the registry pair is a sentinel such as `0x0000000000000000000000000000000000000001`.
- `Validation unavailable/read failed`: WrapHub could not confirm the registry validity flag; failed validation reads are not counted as invalid.

Metadata matching is case-insensitive and defensive against reversed input. Official registry results are normalized into `underlyingAddress` and `wrapperAddress` before rendering or transaction panels use them.

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
- [x] Normalize registry pairs by address and classify known, unknown, restricted, faucet, and system entries
- [x] Use the official registry `isValid` flag instead of treating validation read failures as invalid
- [x] Add Sepolia-only network guard and wallet connection
- [x] Add explorer filters, pair cards, health metrics, copy buttons, and Etherscan links
- [x] Add developer read snippet
- [x] Implement ERC-20 balance reading
- [x] Implement ERC-20 allowance reading
- [x] Implement Sepolia faucet for official public cTokenMocks
- [x] Implement approve wrapper flow
- [x] Implement wrap transaction flow
- [x] Implement ERC-7984 encrypted balance handle reading
- [x] Implement EIP-712 user-decryption flow
- [x] Implement unwrap transaction flow

## Implemented Bounty Requirements

- [x] Surface every ERC-20 to ERC-7984 wrapper pair returned by the official Sepolia registry
- [x] Let users wrap any valid registry pair
- [x] Let users unwrap official wrapper pairs through the request/finalize flow
- [x] Let users decrypt ERC-7984 balances through Zama EIP-712 user-decryption
- [x] Include a Sepolia faucet for official public cTokenMock underlyings
- [x] Preserve registry coverage by showing unknown/revoked pairs instead of hiding them
- [x] Include production UX states for disconnected wallet, wrong network, pending txs, errors, and confirmations

## Known Limitations / Future Improvements

- Resume interrupted unwraps with `useResumeUnshield`.
- Add richer transaction persistence and cross-session reconciliation.
- Add live metadata indexing instead of relying on local known-pair enrichment.
- Complete a production security and UX audit before handling real user value.
