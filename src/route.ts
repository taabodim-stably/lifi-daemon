import { BigNumber } from "@polymeshassociation/polymesh-sdk";
import { Venue } from "@polymeshassociation/polymesh-sdk/internal";
import { Request, Response } from "express";

import { getUserAssetBalance } from "./balance";
import { getRPCClient, RPCClient } from "./client";
import { getAccountAddress } from "./info";
import {
  affirmTransactionPendingInstruction,
  createVenue,
  getAccountCurrentNonce,
  transferToken,
  TransferTokenParams,
} from "./transfer";
import {
  AffirmPendingInstructionParams,
  CreateVenueRouteRequestParams,
  GetAccountAddressRequestParams,
  GetAccountCurrentNonceRequestParams,
  GetAssetBalanceRequestParams,
  TransferAssetRequestParams,
} from "./types";
import Lifi, {
  ChainId,
  CoinKey,
  ConfigUpdate,
  Execution,
  ExecutionSettings,
  findDefaultToken,
  Route
} from "@lifi/sdk";
import { providers, Signer, Wallet } from 'ethers';

import { getTokenDecimal } from "./utils";

/**
 * Route function of /demo
 *
 * @param req request object
 * @param res response object
 */
export async function demo(
  req: Request,
  res: Response
): Promise<void> {
  console.log(`req : ${req}`)
  console.log(`res : ${res}`)
  // const mnemonic = process.env.MNEMONIC || "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";
  const mnemonic = "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";

    // setup wallet
    // if (!process.env.MNEMONIC) {
    //   console.warn(
    //     'Please specify a MNEMONIC phrase in your environment variables: `export MNEMONIC="..."`'
    //   );
    //   return;
    // }
    console.log(">> Setup Wallet");
    const provider = new providers.JsonRpcProvider(
        "https://polygon-rpc.com/",
        137
    );
    console.log(`mnemonic : ${mnemonic}`)
    const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);

    // get Route
    console.log(">> Request route");
    const routeRequest = {
      fromChainId: ChainId.POL, // Polygon
      fromAmount: "1000000", // 1 USDT
      fromTokenAddress: findDefaultToken(CoinKey.USDT, ChainId.POL).address,
      toChainId: ChainId.DAI, // xDai
      toTokenAddress: findDefaultToken(CoinKey.USDT, ChainId.DAI).address,
      options: {
        slippage: 0.03, // = 3%
        allowSwitchChain: false, // execute all transaction on starting chain
        exchanges: {
          allow: [], // only find direct transfers
        },
      },
    };

    // STEP 1: Initialize the API
    console.log(">> Initialize the API");
    // ☝️ This configuration is totally optional! ------------------------------------
    const optionalConfigs: ConfigUpdate = {
      apiUrl: 'https://li.quest', // DEFAULT production endpoint
      rpcs: { // You can provide custom RPCs
        137: ['https://polygon-rpc.com/']
      },
      multicallAddresses: { // You can provide custom addresses for multicall
        137: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD'
      },
      defaultExecutionSettings: { // You can provide default execution settings @see {ExecutionSettings}
        updateCallback: (route: Route):void => {
          console.log('>> Route updated', route);
        },
        switchChainHook: (requiredChainId: number):Promise<Signer | undefined> => {
          console.log('>> Switching to chain', requiredChainId);
          return Promise.resolve(wallet);
        },
        infiniteApproval: false, // DEFAULT false
      }
    }
    // ---------------------------------------------------------------------------

    console.log('>> STEP 0: Before api')
    const api = new Lifi(optionalConfigs);
    console.log('>> STEP 2: Request a route')
    // STEP 2: Request a route
    const routeResponse = await api.getRoutes(routeRequest);
    const route = routeResponse.routes[0];
    console.log(">> Got Route");
    console.log(route);

    // STEP 3: Execute the route
    console.log(">> Start Execution");

    // These are optonal settings for execution ------------------------------------
    const settings: ExecutionSettings = {
      updateCallback: (updatedRoute) => {
        let lastExecution: Execution | undefined = undefined;
        for (const step of updatedRoute.steps) {
          if (step.execution) {
            lastExecution = step.execution;
          }
        }
        console.log(lastExecution);
      },
      switchChainHook: async (requiredChainId: number) => {
        console.log(">>Switching Chains");
        const provider = new providers.JsonRpcProvider(
            "https://rpc.xdaichain.com/",
            requiredChainId
        );
        const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);
        return wallet;
      },
    };
    // ---------------------------------------------------------------------------

    await api.executeRoute(wallet, route, settings);

    console.log(">> Done");
}

/**
 * Route function of /demo
 *
 * @param req request object
 * @param res response object
 */
export async function demoStaging(
  req: Request,
  res: Response
): Promise<void> {
  console.log(`req : ${req}`)
  console.log(`res : ${res}`)
  // const mnemonic = process.env.MNEMONIC || "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";
  const mnemonic = "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";

    // setup wallet
    // if (!process.env.MNEMONIC) {
    //   console.warn(
    //     'Please specify a MNEMONIC phrase in your environment variables: `export MNEMONIC="..."`'
    //   );
    //   return;
    // }
    console.log(">> Setup Wallet");
    const provider = new providers.JsonRpcProvider(
        // "https://mainnet.infura.io/v3/dd8d3da1f53046ffbd6b7393247f96a5",
        "https://goerli.infura.io/v3/6f63a416ecba41729aaa00f44acc5023",
        5
    );
    console.log(`mnemonic : ${mnemonic}`)
    const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);

    // get Route
    console.log(">> Request route");
    const routeRequest = {
      fromChainId: ChainId.GOR, // GOR
      fromAddress: "0x6181e0D52743C01bFA27c5c1Ac06eAFC941BDB9f",
      toAddress: "0x6181e0D52743C01bFA27c5c1Ac06eAFC941BDB9f",
      fromAmount: "20000000000000000", // 0.02eth
      toChainId: ChainId.GOR, // xDai
      fromTokenAddress: findDefaultToken(CoinKey.ETH, ChainId.GOR).address,
      toTokenAddress: findDefaultToken(CoinKey.USDC, ChainId.GOR).address,
      options: {
        // slippage: 0.03, // = 3%
        // allowSwitchChain: false, // execute all transaction on starting chain
        // exchanges: {
        //   allow: [], // only find direct transfers
        // },
      },
    };

    // STEP 1: Initialize the API
    console.log(">> Initialize the API");
    // ☝️ This configuration is totally optional! ------------------------------------
    const optionalConfigs: ConfigUpdate = {
      apiUrl: 'https://staging.li.quest/v1/',
      // rpcs: { // You can provide custom RPCs
      //   137: ['https://polygon-rpc.com/']
      // },
      // multicallAddresses: { // You can provide custom addresses for multicall
      //   137: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD'
      // },
      // defaultExecutionSettings: { // You can provide default execution settings @see {ExecutionSettings}
      //   updateCallback: (route: Route):void => {
      //     console.log('>> Route updated', route);
      //   },
      //   switchChainHook: (requiredChainId: number):Promise<Signer | undefined> => {
      //     console.log('>> Switching to chain', requiredChainId);
      //     return Promise.resolve(wallet);
      //   },
      //   infiniteApproval: false, // DEFAULT false
      // }
    }
    // ---------------------------------------------------------------------------

    console.log('>> STEP 0: Before api')
    const api = new Lifi(optionalConfigs);
    console.log('>> STEP 2: Request a route')
    // STEP 2: Request a route
  api.getRoutes(routeRequest).then((routeResponse) => {
      console.log(`>> Got Route ${JSON.stringify(routeResponse)}`);
      const route = routeResponse.routes[0];

      console.log(route);

      // STEP 3: Execute the route
      console.log(">> Start Execution");

      // These are optonal settings for execution ------------------------------------
      const settings: ExecutionSettings = {
        updateCallback: (updatedRoute) => {
          let lastExecution: Execution | undefined = undefined;
          for (const step of updatedRoute.steps) {
            if (step.execution) {
              lastExecution = step.execution;
            }
          }
          console.log(lastExecution);
        },
        // switchChainHook: async (requiredChainId: number) => {
        //   console.log(">>Switching Chains");
        //   const provider = new providers.JsonRpcProvider(
        //       "https://rpc.xdaichain.com/",
        //       requiredChainId
        //   );
        //   const wallet = Wallet.fromMnemonic(mnemonic).connect(provider);
        //   return wallet;
        // },
      };
      // ---------------------------------------------------------------------------

    api.executeRoute(wallet, route, settings);
    console.log(">> Done");

    })
        .catch(async (error: any) => {
          console.log(">> Got Error in Route");
      console.error(error);
    });
}


/**
 * Route function of /get_user_asset_balance
 *
 * @param req request object
 * @param res response object
 */
export async function getUserAssetBalanceRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as GetAssetBalanceRequestParams;

  const mnemonic = params.mnemonic;
  const assetTicker = params.assetTicker;

  if (!mnemonic) {
    res.status(400).send("Missing mnemonic field");
  } else if (!assetTicker) {
    res.status(400).send("Missing assetTicker field");
  } else {
    await getRPCClient(mnemonic)
      .then((rpcClient: RPCClient) => {
        return getUserAssetBalance(rpcClient, assetTicker);
      })
      .then((balance: BigNumber) => {
        res.send({
          balance: balance.toString(),
        });
      })
      .catch(async (error: any) => {
        const errorMessage = `${error}`;
        console.error(error);
        res.status(400).send(errorMessage);
        console.log("Refreshing the cached RPCClient");
        await getRPCClient(mnemonic, true);
      });
  }
}

/**
 * Route function of /transfer_asset
 *
 * @param req request object
 * @param res response object
 */
export async function transferAssetRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as TransferAssetRequestParams;

  if (!params.amount) {
    res.status(400).send("Missing amount field");
    return;
  }

  if (!Number.isInteger(params.amount)) {
    throw Error(`'amount' must be integer: ${params.amount}`);
  }

  if (!params.receiverAddress) {
    res.status(400).send("Missing receiverAddress field");
    return;
  }

  if (!params.senderMnemonic) {
    res.status(400).send("Missing senderMnemonic field");
    return;
  }

  if (!params.assetTicker) {
    res.status(400).send("Missing assetTicker field");
    return;
  }

  if (!params.nonce) {
    res.status(400).send("Missing nonce field");
    return;
  }

  if (!params.venueID) {
    res.status(400).send("Missing venueID field");
    return;
  }

  // params.memo is optional thus we don't check it

  const decimal = getTokenDecimal(params.assetTicker);
  const actualAmount = params.amount / Math.pow(10, decimal);

  await getRPCClient(params.senderMnemonic)
    .then((senderRPCClient: RPCClient) => {
      return Promise.all([senderRPCClient]);
    })
    .then(([senderRpcClient]) => {
      const transferParams: TransferTokenParams = {
        amount: actualAmount,
        receiverAddress: params.receiverAddress,
        tokenName: params.assetTicker,
        nonce: new BigNumber(params.nonce),
        memo: params.memo,
        venueID: new BigNumber(params.venueID),
      };
      return transferToken(senderRpcClient, transferParams);
    })
    .then(({ txHash, instructionID }) => {
      res.send({
        txHash: txHash,
        instructionID: instructionID,
      });
    })
    .catch(async (error: any) => {
      const errorMessage = `${error}`;
      console.error(error);
      res.status(400).send(errorMessage);
      console.log("Refreshing the cached RPCClient");
      await getRPCClient(params.senderMnemonic, true);
    });
}

/**
 * Route function of /healthcheck
 *
 * @param _ request
 * @param res response object
 */
export async function healthCheckRoute(
  _: Request,
  res: Response
): Promise<void> {
  res.status(200).send({});
}

/**
 * Route function of /get_current_nonce
 *
 * @param req request object
 * @param res response object
 */
export async function getAccountCurrentNonceRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as GetAccountCurrentNonceRequestParams;

  const mnemonic = params.mnemonic;

  if (!mnemonic) {
    res.status(400).send("Missing mnemonic field");
  } else {
    await getRPCClient(mnemonic)
      .then((rpcClient: RPCClient) => {
        return getAccountCurrentNonce(rpcClient);
      })
      .then((nonce: BigNumber) => {
        res.send({
          nonce: nonce.toNumber(),
        });
      })
      .catch(async (error: any) => {
        const errorMessage = `${error}`;
        console.error(error);
        res.status(400).send(errorMessage);
        console.log("Refreshing the cached RPCClient");
        await getRPCClient(mnemonic, true);
      });
  }
}

/**
 * Route function of /get_account_address
 *
 * @param req request object
 * @param res response object
 */
export async function getAccountAddressRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as GetAccountAddressRequestParams;

  const mnemonic = params.mnemonic;

  if (!mnemonic) {
    res.status(400).send("Missing mnemonic field");
  } else {
    await getRPCClient(mnemonic)
      .then((rpcClient: RPCClient) => {
        return getAccountAddress(rpcClient);
      })
      .then((address: string) => {
        res.send({
          address: address,
        });
      })
      .catch(async (error: any) => {
        const errorMessage = `${error}`;
        console.error(error);
        res.status(400).send(errorMessage);
        console.log("Refreshing the cached RPCClient");
        await getRPCClient(mnemonic, true);
      });
  }
}

/**
 * Route function of /create_venue
 *
 * @param req request object
 * @param res response object
 */
export async function createVenueRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as CreateVenueRouteRequestParams;

  const mnemonic = params.mnemonic;

  if (!mnemonic) {
    res.status(400).send("Missing mnemonic field");
  } else {
    await getRPCClient(mnemonic)
      .then((rpcClient: RPCClient) => {
        return createVenue(rpcClient);
      })
      .then((venue: Venue) => {
        res.send({
          venueID: venue.id.toString(),
        });
      })
      .catch(async (error: any) => {
        const errorMessage = `${error}`;
        console.error(error);
        res.status(400).send(errorMessage);
        console.log("Refreshing the cached RPCClient");
        await getRPCClient(mnemonic, true);
      });
  }
}

/**
 * Route function of /affirm_pending_instruction
 *
 * @param req request object
 * @param res response object
 */
export async function affirmPendingInstructionRoute(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as AffirmPendingInstructionParams;

  if (!params.mnemonic) {
    res.status(400).send("Missing mnemonic field");
    return;
  }

  if (!params.pendingInstructionID) {
    res.status(400).send("Missing pendingInstructionID field");
    return;
  }

  await getRPCClient(params.mnemonic)
    .then((rpcClient: RPCClient) => {
      return affirmTransactionPendingInstruction(
        rpcClient,
        params.pendingInstructionID
      );
    })
    .then((affirmationTxHash: string) => {
      res.send({
        affirmationTxHash: affirmationTxHash,
      });
    })
    .catch(async (error: any) => {
      const errorMessage = `${error}`;
      console.error(error);
      res.status(400).send(errorMessage);
      console.log("Refreshing the cached RPCClient");
      await getRPCClient(params.mnemonic, true);
    });
}
