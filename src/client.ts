import { LocalSigningManager } from "@polymeshassociation/local-signing-manager";
import { Polymesh } from "@polymeshassociation/polymesh-sdk";

import { getRunConfig as getRunConfig } from "./config";

/**
 * A wrapper for Polymesh API object, which will clean out the underlying object after disconnecting
 */
export class RPCClient {
  private _client: Polymesh;
  public readonly nodeUrl: string;
  public readonly mnemonic: string;

  /**
   * Create new RPCClient object
   *
   * @param mnemonic the user wallet mnemonic
   * @param nodeUrl the RPC node URL
   */
  constructor(mnemonic: string, nodeUrl: string) {
    this.mnemonic = mnemonic;
    this.nodeUrl = nodeUrl;
  }

  /**
   * Re-initialize the underlying Polymesh API object
   */
  private async _refresh(): Promise<void> {
    const signingManagerSender: LocalSigningManager =
      await LocalSigningManager.create({
        accounts: [
          {
            mnemonic: this.mnemonic,
          },
        ],
      });

    // Connecting to the API
    this._client = await Polymesh.connect({
      nodeUrl: this.nodeUrl,
      signingManager: signingManagerSender,
    });
  }

  /**
   * Get the underlying Polymesh object
   *
   * @returns the Polymesh API object
   */
  async getClient(): Promise<Polymesh> {
    if (!this._client) {
      await this._refresh();
      const identity = await this._client.getSigningIdentity();

      if (!identity) {
        throw Error(`Cannot get identity with the current mnemonic`);
      }
      return this._client;
    }
    return this._client;
  }

  /**
   * Disconnect the underlying Polymesh API object
   */
  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.disconnect();
      this._client = undefined;
    } else {
      console.log(
        "There is no underlying Polymesh client to disconnect (maybe it was disconnected before or not initialized yet)"
      );
    }
  }
}

const rpcClientCache: { [id: string]: RPCClient } = {};

/**
 * Get the API object
 *
 * @param mnemonic the mnemonic of the user account
 * @param force_new if true, force re-initialize the Polymesh API object. False otherwise
 * @returns the cached Polymesh API object
 */
export async function getRPCClient(
  mnemonic: string,
  force_new: boolean = false
): Promise<RPCClient> {
  const isCached: boolean = mnemonic in rpcClientCache;

  if (force_new || !isCached) {
    console.log("Initializing a new RPCClient");
    const nodeUrl = getRunConfig().PolymeshRPC.NodeURL;

    if (!nodeUrl) {
      throw Error("Missing getRunConfig().PolymeshRPC.NodeURL");
    }

    const rpcClient: RPCClient = new RPCClient(mnemonic, nodeUrl);
    rpcClientCache[mnemonic] = rpcClient;
  }
  return rpcClientCache[mnemonic];
}
