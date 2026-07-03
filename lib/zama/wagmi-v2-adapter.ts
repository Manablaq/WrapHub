import {
  BaseSigner,
  TransactionRevertedError,
  createConfig as createCoreConfig,
  type ContractAbi,
  type EIP712TypedData,
  type GenericProvider,
  type Hex,
  type ReadContractArgs,
  type ReadContractConfig,
  type ReadContractReturnType,
  type ReadFunctionName,
  type TransactionReceipt,
  type WalletAccount,
  type WriteContractArgs,
  type WriteContractConfig,
  type WriteFunctionName,
  type ZamaConfig,
  type ZamaConfigBase,
} from "@zama-fhe/sdk";
import type { AtLeastOneChain } from "@zama-fhe/sdk/chains";
import { getAddress } from "viem";
import type { Config } from "wagmi";
import { getAccount, getBlock, getChainId, readContract, signTypedData, waitForTransactionReceipt, watchAccount, writeContract } from "wagmi/actions";

type WagmiAccount = ReturnType<typeof getAccount>;

function walletAccountFromWagmi(account: WagmiAccount): WalletAccount | undefined {
  if (account.status === "disconnected" || !account.address || account.chainId === undefined) {
    return undefined;
  }

  return { address: getAddress(account.address), chainId: account.chainId };
}

class WagmiV2Provider implements GenericProvider {
  readonly #config: Config;

  constructor(config: Config) {
    this.#config = config;
  }

  async getChainId(): Promise<number> {
    return getChainId(this.#config);
  }

  async readContract<
    const TAbi extends ContractAbi,
    TFunctionName extends ReadFunctionName<TAbi>,
    const TArgs extends ReadContractArgs<TAbi, TFunctionName>,
  >(
    config: ReadContractConfig<TAbi, TFunctionName, TArgs>,
  ): Promise<ReadContractReturnType<TAbi, TFunctionName, TArgs>> {
    return readContract(this.#config, config);
  }

  async waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt> {
    try {
      return await waitForTransactionReceipt(this.#config, { hash });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("could not be found") || message.includes("Transaction not found")) {
        throw new TransactionRevertedError(
          `Could not find transaction receipt for hash "${hash.slice(0, 10)}...".`,
          { cause: error instanceof Error ? error : undefined },
        );
      }
      throw error;
    }
  }

  async getBlockTimestamp(): Promise<bigint> {
    const block = await getBlock(this.#config);
    return block.timestamp;
  }
}

class WagmiV2Signer extends BaseSigner {
  readonly #config: Config;
  readonly #unsubscribe: () => void;

  constructor(config: Config) {
    super(walletAccountFromWagmi(getAccount(config)));
    this.#config = config;
    this.#unsubscribe = watchAccount(this.#config, {
      onChange: (account) => {
        this.walletAccount.setSnapshot(walletAccountFromWagmi(account));
      },
    });
  }

  async signTypedData(typedData: EIP712TypedData): Promise<Hex> {
    const { EIP712Domain, ...types } = typedData.types;
    void EIP712Domain;
    return signTypedData(this.#config, {
      primaryType: typedData.primaryType,
      types,
      domain: typedData.domain,
      message: {
        ...typedData.message,
        startTimestamp: BigInt(typedData.message.startTimestamp),
        durationDays: BigInt(typedData.message.durationDays),
      },
    } as Parameters<typeof signTypedData>[1]);
  }

  async writeContract<
    const TAbi extends ContractAbi,
    TFunctionName extends WriteFunctionName<TAbi>,
    const TArgs extends WriteContractArgs<TAbi, TFunctionName>,
  >(config: WriteContractConfig<TAbi, TFunctionName, TArgs>): Promise<Hex> {
    return writeContract(this.#config, config as Parameters<typeof writeContract>[1]);
  }

  protected override onDispose(): void {
    this.#unsubscribe();
  }
}

export function createZamaWagmiV2Config<const TChains extends AtLeastOneChain>(
  params: ZamaConfigBase<TChains> & { wagmiConfig: Config },
): ZamaConfig {
  const { wagmiConfig, ...baseParams } = params;
  return createCoreConfig({
    ...baseParams,
    signer: new WagmiV2Signer(wagmiConfig),
    provider: new WagmiV2Provider(wagmiConfig),
  });
}
