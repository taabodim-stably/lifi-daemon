export interface RunConfig {
  readonly ToChainKey: string;
  readonly FromChainKey: string;
  readonly FromProviderURL: string;
  readonly FromNetworkID: number;

  readonly BindingPort: number;
  readonly LiFiAPIURL: string;

  readonly SecurityToken: {
    readonly USDS: {
      TokenDecimal: number;
    };
  };
}
