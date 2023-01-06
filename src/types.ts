/**
 * Request parameters interfaces
 */

export interface GetAssetBalanceRequestParams {
  readonly mnemonic: string;
  readonly assetTicker: string;
}

export interface TransferAssetRequestParams {
  readonly senderMnemonic: string;
  readonly receiverAddress: string;
  readonly amount: number;
  readonly assetTicker: string;
  readonly nonce: number;
  readonly memo: string;
  readonly venueID: number;
}

export interface GetAccountCurrentNonceRequestParams {
  readonly mnemonic: string;
}

export interface GetAccountAddressRequestParams {
  readonly mnemonic: string;
}

export interface CreateVenueRouteRequestParams {
  readonly mnemonic: string;
}

export interface AffirmPendingInstructionParams {
  readonly mnemonic: string;
  readonly pendingInstructionID: string;
}
