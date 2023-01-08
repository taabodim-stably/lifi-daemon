import {providers, Wallet} from "ethers";
import {getRunConfig} from "@root/config";

export class WalletHolder {
    private static instance: WalletHolder;
    public wallet: Wallet;

    private constructor() {
        // private constructor to prevent instantiation
    }

    static getInstance(): WalletHolder {
        if (!WalletHolder.instance) {
            WalletHolder.instance = new WalletHolder();
            WalletHolder.instance.wallet = getWallet()
        }
        return WalletHolder.instance;
    }
}

export function getWallet(): Wallet {
    const mnemonic = process.env.MNEMONIC;
    // setup wallet
    if (!process.env.MNEMONIC) {
        console.warn(
            'Please specify a MNEMONIC phrase in your environment variables: `export MNEMONIC="..."`'
        );
        return undefined;
    }
    console.log(">> Setup Wallet");
    const provider = new providers.JsonRpcProvider(
        getRunConfig().FromProviderURL,
        getRunConfig().FromNetworkID
    );
    return Wallet.fromMnemonic(mnemonic).connect(provider);
}
