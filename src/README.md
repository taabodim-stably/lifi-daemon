## Using `RPCClient`

The `RPCClient` class is a wrapper for the Polymesh API object which will clean out the underlying object after disconnecting


### Get asset balance
```typescript
import { getRPCClient, RPCClient } from "./client";

function main(): void {
  // const client: RPCClient = await getRPCClient(ISSUER_MNEMONIC, true);
  const client: RPCClient = await getRPCClient(ISSUER_MNEMONIC);

  const balance = await getUserAssetBalance(client, "USDS");
  const balanceValue = balance.toNumber();
  console.log(balanceValue);

  // Get the underlying `Polymesh` object
  const api: Polymesh = await client.getClient()

  await client.disconnect();
}
```

### Transfer asset

```typescript
import { getRPCClient, RPCClient } from "./client";

function main() {
  const receiverAddress =
    "0xcc1d3ca2d5521bb460d6ed1d130d9e2cd21c809121d411bcc60489dad542919c";

  const client: RPCClient = await getRPCClient(ISSUER_MNEMONIC, true);
  const txHash = await transferToken(client, {
    receiverAddress: receiverAddress,
    amount: 12.34,
    tokenName: "USDS",
    nonce: 4345,
    memo: "your optional memo",
    venueID: 1324,
  });
  console.log(txHash)

  await client.disconnect();
}
```
