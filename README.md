# LiFi Daemon

## Prepare AWS CLI and IAM

Config your local AWS CLI to have a privileged IAM account
- We need it to deploy this service to the AWS ECS

## Development

Check [development tutorial](./README.dev.md)

## Prepare Venue ID

Before deploying to ECS for Production, you need to setup the `SecurityToken.VenueID` in `env/prod.toml`

First, place your issuer mnemonic to `secrets/issuer-mnemonic.txt`

Then, run the following command and wait a bit:
```shell
$ yarn tsnode src/scripts/create-venue.ts
```

The expected output (trimmed)
```
...
Initializing a new RPCClient
Loading TOML config from env/beta.toml
(node:16319) [DEP0128] DeprecationWarning: Invalid 'main' field in '/Users/dinosaurchi/Desktop/Project/stably-prime/lifi-daemon/node_modules/@polymeshassociation/local-signing-manager/package.json' of './src/index.js'. Please either fix that or report it to the module author
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:16319) [DEP0128] DeprecationWarning: Invalid 'main' field in '/Users/dinosaurchi/Desktop/Project/stably-prime/lifi-daemon/node_modules/@polymeshassociation/polymesh-sdk/package.json' of 'dist/index.js'. Please either fix that or report it to the module author
2022-12-07 11:16:58        REGISTRY: Unknown signed extensions StoreCallMetadata found, treating them as no-effect
VenueID: 1005
```

Then, copy the `VenueID` value and set it to `SecurityToken.VenueID` in `env/prod.toml`

You only need to do this step once, then just commit the venue ID and use it forever

## Deployment

```shell
$ make docker.buildanddeploy.lifi-daemon.prod
```

## API

```
POST /lifi-daemon/transfer_asset

Request:
{
  "senderMnemonic": "",
  "receiverAddress": "",
  "amount": 12000000, // 1 USDS = 1e6 token amount
  "assetTicker": "USDS",
  "nonce": 1234,
  "venueID": 1244,
  "memo": "optional memo"
}

Response:
{
  "txHash": "",
  "instructionID": "1244"
}
```
- You can get the nonce via `/lifi-daemon/get_current_nonce` endpoint
- You can create a venueID via `/lifi-daemon/create_venue` endpoint
  - Save the created venueID to somewhere to be reused
- The receiver needs to affirm the instruction of `instructionID` to finish the transaction

```
POST /lifi-daemon/get_user_asset_balance

Request:
{
  "mnemonic": "",
  "assetTicker": "USDS"
}

Response:
{
  "balance": 1234 // 1234 USDS
}
```

```
POST /lifi-daemon/get_current_nonce

Request:
{
  "mnemonic": ""
}

Response:
{
  "nonce": 65443
}
```

```
POST /lifi-daemon/get_account_address

Request:
{
  "mnemonic": ""
}

Response:
{
  "address": ""
}
```

```
POST /lifi-daemon/create_venue

Request:
{
  "mnemonic": ""
}

Response:
{
  "venueID": 1006
}
```

```
POST /lifi-daemon/affirm_pending_instruction

Request:
{
  "mnemonic": "",
  "pendingInstructionID", "1234"
}

Response:
{
  "affirmationTxHash": ""
}
```
