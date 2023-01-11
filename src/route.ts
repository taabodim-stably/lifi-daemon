import {Request, Response} from "express";

import Lifi, {
    ChainId,
    ChainKey,
    CoinKey,
    ConfigUpdate,
    Execution,
    ExecutionSettings,
    findDefaultToken,
    getChainById,
    getChainByKey,
    Route
} from "@lifi/sdk";

import {providers, Signer, Wallet} from 'ethers';


import {getRunConfig} from "./config";
import {WalletHolder} from "./wallet";

const LRU = require('lru-cache')
const options = {

    max: 500,
    // for use with tracking overall storage size
    maxSize: 500,
    // for use with tracking overall storage size
    sizeCalculation: (_) => {
        return 1
    },
    // how long to live in ms
    ttl: 1000 * 60 * 60,
    // return stale items before removing from cache?
    allowStale: false,
    updateAgeOnGet: false,
    updateAgeOnHas: false,
}
const txnCache = new LRU(options)

export function getExecutionSettings() : ExecutionSettings {
    return {
        updateCallback: (updatedRoute) => {
            let lastExecution: Execution | undefined = undefined;
            for (const step of updatedRoute.steps) {
                // console.log(`step : ${JSON.stringify(step)}`);
                if (step.execution) {
                    lastExecution = step.execution;
                }
            }
            console.log(`lastExecution : ${JSON.stringify(lastExecution)}`);
            if (lastExecution.process.length > 0) {
                console.log(`txnCache.set : updatedRoute.id : ${updatedRoute.id}`);
                txnCache.set(updatedRoute.id, lastExecution)
            }
        },
        switchChainHook: async (requiredChainId: number) => {
            console.log(`>>Switching Chains to ${requiredChainId}`);
            const switchToChain = getChainById(requiredChainId)
            console.log(`>>Switching Chains to key ${switchToChain.key}`);
            const providerURL = getChainProviderURLByKey(switchToChain.id)
            const provider = new providers.JsonRpcProvider(
                providerURL,
                requiredChainId
            );

            const mnemonic = "dish potato radar subject rescue leopard smoke resource survey fashion check abuse";

            return Wallet.fromMnemonic(mnemonic).connect(provider);
        },
    }
}

export function getChainByStr(
    chainStr: string,
    // res: Response
): ChainKey {
    chainStr = chainStr.toLowerCase()
    switch (chainStr) {
        case "arb":
            return ChainKey.ARB;
        case "gor":
            return ChainKey.GOR;
        case "eth":
            return ChainKey.ETH;
        case "pol":
            return ChainKey.POL;
        case "bsc":
            return ChainKey.BSC;
        case "ava":
            return ChainKey.AVA;
        default:
            return undefined
    }
}
export function getCoinByKey(
    coinStr: string,
    // res: Response
): CoinKey {
    coinStr = coinStr.toUpperCase()
    switch (coinStr) {
        case "WETH":
            return CoinKey.WETH;
        case "WBTC":
            return CoinKey.WBTC;
        case "USDC":
            return CoinKey.USDC;
        case "USDT":
            return CoinKey.USDT;
        case "DAI":
            return CoinKey.DAI;
        case "ETH":
            return CoinKey.ETH;
        default:
            return undefined
    }
}

export async function executeQuote(
    req: Request,
    res: Response
): Promise<string> {
    try {
        // code that might throw an exception goes here

        console.log(`executeQuote req query : ${JSON.stringify(req.query)}`)
        console.log(`executeQuote req route : ${req.route}`)
        console.log(`executeQuote req url : ${req.url}`)
        console.log(`executeQuote getRunConfig().FromChainKey : ${getRunConfig().FromChainKey}`)
        console.log(`executeQuote toChain : ${req.query.toChain}`)

        const walletHolder = await WalletHolder.getInstance();
        // get Route
        console.log(">> Request route");
        console.log(`executeQuote getRunConfig().FromChainKey : ${getRunConfig().FromChainKey}`)
        let fromChainKey = getChainByStr(getRunConfig().FromChainKey);
        console.log(`executeQuote fromChainKey : ${fromChainKey}`)

        let toChainStr = <string> req.query.toChain
        console.log(`executeQuote toChainStr : ${toChainStr}`)

        let toChainKey: ChainKey = getChainByStr(toChainStr);


        let fromTokenStr = <string> req.query.fromToken
        let toTokenStr = <string> req.query.toToken
        let toAddress = <string> req.query.toAddress

        let fromChain = getChainByKey(fromChainKey)
        let toChain = getChainByKey(toChainKey)

        let fromToken = getCoinByKey(fromTokenStr)
        let toToken = getCoinByKey(toTokenStr)

        // let fromToken: CoinKey = <CoinKey>CoinKey[fromTokenStr];
        // let toToken: CoinKey = <CoinKey>CoinKey[toTokenStr];

        let fromTokenObj = findDefaultToken(fromToken, fromChain.id)
        let fromAmountF = parseFloat(<string> req.query.fromAmount); // num will be 123

        const routeRequest = {
            fromChainId: getChainByKey(fromChainKey).id,
            fromAmount: fromAmountF * Math.pow(10, fromTokenObj.decimals) + "",
            fromTokenAddress: fromTokenObj.address,
            toChainId: getChainByKey(toChainKey).id,
            toTokenAddress: findDefaultToken(toToken, toChain.id).address,
            toAddress: toAddress,
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
                    return Promise.resolve(walletHolder.wallet);
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
        console.log(`>> Got Route  ${JSON.stringify(routeResponse)}`);
        if (routeResponse.routes.length == 0) {
            console.log(`there is no such route `)
            res.send({
             Error: `there is no such route `
            })
            res.status(500)
            return ""
        }
        const route = routeResponse.routes[0];


        // STEP 3: Execute the route
        console.log(">> Start Execution");

        await api.executeRoute(walletHolder.wallet, route, getExecutionSettings());

        console.log(">> Done, waiting for txHash");

        const execution = await waitForTxnExecution(route.id)
        console.log(`Done with swap, RouteID ${route.id}, execution ${execution}`);
        res.send(JSON.stringify({
            Data: execution,
            Error: ""
        }))

    } catch (err) {
        console.error(`got error  ${err}`);
        res.status(500)
        res.send({
            Error: err.message
        })
    }
    return ""
}

async function waitForTxnExecution(routeID: string): Promise<Execution> {
    while (!txnCache.has(routeID)) {
        console.log(`waitForTxnHash routeID : ${routeID}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.log(`done waiting for route : ${routeID}`);
    return <Execution> txnCache.get(routeID)
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
    try {
        console.log(`getTxnStatus req.query : ${req.query}`)

        const fromChain = req.query.fromChain
        const bridge = req.query.bridge
        const toChain = req.query.toChain
        const txHash = req.query.txHash

        const url = `${getRunConfig().LiFiAPIURL}status?bridge=${bridge}&fromChain=${fromChain}&toChain=${toChain}&txHash=${txHash}`;
        console.log(`getTxnStatus url ${url}`)
        let data = await fetch(url)
            .then(res => res.json())
            .catch((err) => {
                console.log(`getTxnStatus err : ${err}`)
                res.status(500)
                res.send({Error:"error in getting txn status" + err.message})
            })
        console.log(`tx status ${JSON.stringify(data)}`);
        res.send({Data: data})
    } catch (err) {
        console.error(err.message);
        res.status(500)
        res.send({Error: "error in getting txn status" + err.message})
    }
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