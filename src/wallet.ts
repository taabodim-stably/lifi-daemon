import {providers, Wallet} from "ethers";
import {getRunConfig} from "./config";
import * as AWS from 'aws-sdk';

export class WalletHolder {
    private static instance: WalletHolder;
    public wallet: Wallet;

    private constructor() {
        // private constructor to prevent instantiation
    }

    static async getInstance(): Promise<WalletHolder> {
        if (!WalletHolder.instance) {
            WalletHolder.instance = new WalletHolder();
            WalletHolder.instance.wallet = await getWallet()
        }
        return WalletHolder.instance;
    }
}

export async function getSecret(): Promise<string> {
    let secret = ""
    if (getRunConfig().Environment == "prod") {
        console.log(`secret from aws`);
        secret = await getAWSSecret();
        if (secret == "") {
            throw Error("failed to get secret from aws");
        }
    }
    if (secret == "") {
        // goerli test wallet
        secret = "dish potato radar subject rescue leopard smoke resource survey fashion check abuse"
        console.log(`using goerli test wallet secret`)
    }
    return secret
}

export async function getWallet(): Promise<Wallet> {
    let secret = await getSecret()
    // setup wallet
    if (!secret) {
        console.warn(
            'Please specify a secret phrase`'
        );
        return undefined;
    }
    console.log(">> Setup Wallet");
    const provider = new providers.JsonRpcProvider(
        getRunConfig().FromProviderURL,
        getRunConfig().FromNetworkID
    );
    return Wallet.fromMnemonic(secret).connect(provider);
}


async function getAWSSecret(): Promise<string> {
    AWS.config.update({ region: 'us-west-2' });

    const client = new AWS.SecretsManager();
    const secretName = 'lifi-from-wallet';

    try {
        const data = await client.getSecretValue({ SecretId: secretName }).promise();
        const secret = JSON.parse(data.SecretString);
        return secret.key;
    } catch (err) {
        // An error occurred
        console.error(err);
        return ""
    }
}
