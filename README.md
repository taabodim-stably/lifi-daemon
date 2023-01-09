# LiFi Daemon

## Prepare AWS CLI and IAM

Config your local AWS CLI to have a privileged IAM account
- We need it to deploy this service to the AWS ECS

## Development

Check [development tutorial](./README.dev.md)

The expected output (trimmed)
```
...
Loading TOML config from env/prod.toml
```

Then, copy the `VenueID` value and set it to `SecurityToken.VenueID` in `env/prod.toml`

You only need to do this step once, then just commit the venue ID and use it forever

## Deployment

```shell
$ make docker.buildanddeploy.lifi-daemon.prod
```

## API

```
Request:
GET /lifi-daemon/execute-quote?toChain=gor&fromToken=eth&toToken=USDC&toAddress=0xD78a0beEc67f3902AcAa0E784D9FbB942B2bAe6d&fromAmount=0.0002

Response:

{"txHash":"0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71"}
```

```
Request:
GET /lifi-daemon/txn-status?bridge=&fromChain=gor&toChain=gor&txHash=0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71

Response:

{"status":"DONE","substatus":"COMPLETED","substatusMessage":"The transfer is complete.","tool":"uniswap-gor","sending":{"chainId":5,"txHash":"0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71","txLink":"https://goerli.etherscan.io/tx/0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71","amount":"2000000000000","token":{"chainId":5,"address":"0x0000000000000000000000000000000000000000","name":"ETH","symbol":"ETH","decimals":18,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png","coinKey":"ETH"},"gasAmount":"524187000000000","gasPrice":"3000000000","gasUsed":"174729","gasToken":{"chainId":5,"address":"0x0000000000000000000000000000000000000000","name":"ETH","symbol":"ETH","decimals":18,"logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png","coinKey":"ETH"},"gasAmountUSD":"0.00"},"receiving":{"txHash":"0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71","txLink":"https://goerli.etherscan.io/tx/0x4f29eb2d693a033df41f6cda05dd2f30956765f511746cdd6d5bba68390afd71","amount":"4763371109","token":{"address":"0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c","decimals":6,"symbol":"USDC","chainId":5,"coinKey":"USDC","name":"USDC","logoURI":"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},"chainId":5}}
```