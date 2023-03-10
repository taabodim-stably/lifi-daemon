export interface RunConfig {

  readonly FromChainKey: string;
  readonly FromProviderURL: string;
  readonly FromNetworkID: number;

  readonly BindingPort: number;
  readonly LiFiAPIURL: string;
  readonly Environment: string;
  readonly UseArbitrumTempWallet: boolean;

  readonly SecurityToken: {
    readonly USDS: {
      TokenDecimal: number;
    };
  };
}
