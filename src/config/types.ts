export interface RunConfig {
  readonly BindingPort: number;
  readonly PolymeshRPC: {
    readonly NodeURL: string;
  };
  readonly SecurityToken: {
    readonly USDS: {
      TokenDecimal: number;
    };
  };
}
