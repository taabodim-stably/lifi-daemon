import { BigNumber, Polymesh } from "@polymeshassociation/polymesh-sdk";
import { Venue } from "@polymeshassociation/polymesh-sdk/internal";
import { VenueType } from "@polymeshassociation/polymesh-sdk/types";

import { RPCClient } from "./client";
import { getAccountAddress } from "./info";
import { sleep } from "./utils";

export interface TransferTokenParams {
  readonly receiverAddress: string;
  readonly amount: number;
  readonly tokenName: string;
  readonly nonce: BigNumber;
  readonly venueID: BigNumber;
  readonly memo?: string;
}

/**
 * Transfer security token from sender to receiver
 *
 * @param senderRpcClient the RPC object initialized with the sender mnemonic
 * @param params the params interface
 * @param maxTrials max trials when fetching the status
 * @returns the txHash and the corresponding instruction ID
 */
export async function transferToken(
  senderRpcClient: RPCClient,
  params: TransferTokenParams,
  maxTrials: number = 100
): Promise<{
  txHash: string;
  instructionID: string;
}> {
  const venueId = params.venueID;

  if (!venueId) {
    throw Error(`Missing params.venueID`);
  }

  // Get the Venue object
  const venueSender = await getVenue(senderRpcClient, new BigNumber(venueId));

  const apiSender: Polymesh = await senderRpcClient.getClient();
  const identitySender = (await apiSender.getSigningIdentity())!;

  // Get the receiver portfolio
  const identityReceiver = await apiSender.identities.getIdentity({
    did: params.receiverAddress!,
  });
  const destinationPortfolio = await identityReceiver.portfolios.getPortfolio();

  // Prepapre instruction
  const instructionQ = await venueSender.addInstruction(
    {
      legs: [
        {
          from: identitySender,
          to: destinationPortfolio,
          amount: new BigNumber(params.amount),
          asset: params.tokenName,
        },
      ],
      tradeDate: null,
      valueDate: null,
      memo: params.memo,
    },
    {
      // Use nonce to have idempotent transaction
      nonce: params.nonce,
    }
  );

  // Execute the instruction
  var txHash: string = undefined;

  instructionQ.onStatusChange((transaction) => {
    txHash = transaction.txHash;
  });

  const instruction = await instructionQ.run();

  while (maxTrials > 0) {
    console.log(`Processing: ${txHash}`);
    maxTrials -= 1;

    if (txHash && txHash.length > 10) {
      return {
        txHash: txHash,
        instructionID: instruction.toHuman(),
      };
    }

    await sleep(1000);
  }

  throw Error(`Cannot get txHash: ${txHash}`);
}

/**
 * Return the Venue object, create a new venue if the venue ID is not provided
 *
 * @param rpcClient the RPC client object initialized with user mnemonic
 * @param venueId the venue ID
 * @returns the Venue object
 */
export async function getVenue(
  rpcClient: RPCClient,
  venueId: BigNumber
): Promise<Venue> {
  const api: Polymesh = await rpcClient.getClient();
  return await api.settlements.getVenue({ id: venueId });
}

/**
 * Create and return the Venue object
 *
 * @param rpcClient the RPC client object initialized with user mnemonic
 * @returns the Venue object
 */
export async function createVenue(rpcClient: RPCClient): Promise<Venue> {
  const api: Polymesh = await rpcClient.getClient();
  const venueQSender = await api.settlements.createVenue({
    description: null,
    type: VenueType.Distribution,
  });
  const venueSender = await venueQSender.run();
  return venueSender;
}

/**
 * Get the account current Nonce
 *
 * @param accountRpcClient the RPC Client object initialized with user mnemonic
 */
export async function getAccountCurrentNonce(
  accountRpcClient: RPCClient
): Promise<BigNumber> {
  const apiAccount: Polymesh = await accountRpcClient.getClient();
  const identityAccount = (await apiAccount.getSigningIdentity())!;

  // Get the current nonce to have idempotent transaction
  const account = await identityAccount.getPrimaryAccount();
  const nonce = await account.account.getCurrentNonce();
  return nonce;
}

/**
 * Accept pending distribution transaction
 *
 * @param rpcClient the RPC object initialized with the sender mnemonic
 * @param instructionID the instruction ID of the instruction to be affirmed
 * @param maxTrials max trials when fetching the status
 * @returns the affirmation transaction hash for this instruction
 */
export async function affirmTransactionPendingInstruction(
  rpcClient: RPCClient,
  instructionID: string,
  maxTrials: number = 100
): Promise<string> {
  const apiAccount: Polymesh = await rpcClient.getClient();
  const identityAccount = (await apiAccount.getSigningIdentity())!;

  const instructions = await identityAccount.getInstructions();

  if (instructions.pending.length < 1) {
    const address = await getAccountAddress(rpcClient);
    throw Error(`No pending instruction for account ${address}`);
  }

  // If the instruction is pending, affirm it
  for (const pendingInstruction of instructions.pending) {
    const id = pendingInstruction.toHuman();

    if (id === instructionID) {
      const affirmTx = await pendingInstruction.affirm();

      // Execute the instruction
      var txHash: string = undefined;

      affirmTx.onStatusChange((transaction) => {
        txHash = transaction.txHash;
      });

      await affirmTx.run();

      while (maxTrials > 0) {
        console.log(`Processing affirmation: ${txHash}`);
        maxTrials -= 1;

        if (txHash && txHash.length > 10) {
          return txHash;
        }

        await sleep(1000);
      }

      throw Error(`Cannot get affirmation txHash: ${txHash}`);
    }
  }

  throw Error(
    `Not found a pending instruction with instructionID ${instructionID}`
  );
}
