import { RPCClient } from "./client";

/**
 * Get the address of the user account
 *
 * @param rpcClient the RPC client object initialized with user mnemonic
 * @returns the account hex address string
 */
export async function getAccountAddress(rpcClient: RPCClient): Promise<string> {
  if (!rpcClient) {
    throw new Error("Missing rpcClient");
  }

  const api = await rpcClient.getClient();
  const identity = (await api.getSigningIdentity())!;
  return identity.did;
}
