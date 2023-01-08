import { Request, Response } from "express";

import Lifi, {
  ChainId, ChainKey,
  CoinKey,
  ConfigUpdate,
  Execution,
  ExecutionSettings,
  findDefaultToken, getChainById, getChainByKey,
  Route
} from "@lifi/sdk";
import { providers, Signer, Wallet } from 'ethers';

import {getRunConfig} from "@root/config";
import {getWallet} from "@root/wallet";
// import {WalletHolder} from "@root/wallet";

// const walletHolder = WalletHolder.getInstance();

export async function executeQuote(
  req: Request,
  _: Response
): Promise<void> {
  console.log(`executeQuote req : ${req}`)


    // get Route
    console.log(">> Request route");

    let fromChainKey: ChainKey = <ChainKey>ChainKey[getRunConfig().FromChainKey];
    let toChainKey: ChainKey = <ChainKey>ChainKey[getRunConfig().ToChainKey];


    let fromTokenStr = req.get("fromToken")
    let toTokenStr = req.get("toToken")

    let fromChain = getChainByKey(fromChainKey);
    let toChain = getChainByKey(toChainKey);

    let fromToken: CoinKey = <CoinKey>CoinKey[fromTokenStr];
    let toToken: CoinKey = <CoinKey>CoinKey[toTokenStr];

    const routeRequest = {
      fromChainId: getChainByKey(fromChainKey).id,
      fromAmount: req.get("fromAmount"),
      fromTokenAddress: findDefaultToken(fromToken, fromChain.id).address,
      toChainId: getChainByKey(toChainKey).id,
      toTokenAddress: findDefaultToken(toToken, toChain.id).address,
      options: {
        slippage: 0.03, // = 3%
        allowSwitchChain: true, // execute all transaction on starting chain
        // exchanges: {
          // allow: [], // only find direct transfers
        // },
      },
    };

    // STEP 1: Initialize the API
    console.log(">> Initialize the API");
    // ☝️ This configuration is totally optional! ------------------------------------
    const optionalConfigs: ConfigUpdate = {
      apiUrl: getRunConfig().LiFiAPIURL, // DEFAULT production endpoint

      defaultExecutionSettings: { // You can provide default execution settings @see {ExecutionSettings}
        updateCallback: (route: Route):void => {
          console.log('>> Route updated', route);
        },
        switchChainHook: (requiredChainId: number):Promise<Signer | undefined> => {
          console.log('>> Switching to chain', requiredChainId);
          return Promise.resolve(getWallet());
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
        const switchToChain = getChainById(requiredChainId)
        console.log(`>>Switching Chains to ${switchToChain.key}`);
        const providerURL = getChainProviderURLByKey(switchToChain.id)
        const provider = new providers.JsonRpcProvider(
            providerURL,
            requiredChainId
        );
        const mnemonic = "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";

        return Wallet.fromMnemonic(mnemonic).connect(provider);
      },
    };
    // ---------------------------------------------------------------------------

    // @ts-ignore
  await api.executeRoute(req.FromWallet, route, settings);
    console.log(">> Done");
}

/**
 * Route function of /execute-quote
 *
 * @param req request object
 * @param res
 */
export async function getTxnStatus(
  req: Request,
  res: Response
): Promise<void> {
  console.log(`getTxnStatus req : ${req}`)

  const fromChain =  req.get("fromChain")
  const bridge = req.get("bridge")
  const toChain = req.get("toChain")
  const txHash = req.get("txHash")

  const url = `${getRunConfig().LiFiAPIURL}/status?bridge=${bridge}&fromChain=${fromChain}&toChain=${toChain}&txHash=${txHash}`;
  const response = await fetch(url);
  const data = response.json();
  console.log(`tx status ${data}`);
  res.send(data)

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

export function getChainProviderURLByKey(chainID: number) : string {
  switch (chainID) {
    case 1:
      return "eth"
    default:
      return "Invalid chainID, cant find a usl for " + chainID;
  }
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