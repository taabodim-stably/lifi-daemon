import { BigNumber } from "@polymeshassociation/polymesh-sdk";

import { RPCClient } from "./client";

/**
 * Get asset balance of a user
 *
 * @param rpcClient the RPC client object initialized with user mnemonic
 * @param assetTicker the asset ticker (USDS,...)
 * @returns the balance value
 */
export async function getUserAssetBalance(
  rpcClient: RPCClient,
  assetTicker: string
): Promise<BigNumber> {
  if (!rpcClient) {
    throw new Error("Missing rpcClient");
  }

  if (!assetTicker) {
    throw new Error("Missing assetTicker");
  }

  const api = await rpcClient.getClient();
  const identity = (await api.getSigningIdentity())!;
  const balance = await identity.getAssetBalance({ ticker: assetTicker });
  return balance;
}
