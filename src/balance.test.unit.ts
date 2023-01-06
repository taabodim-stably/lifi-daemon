import { getUserAssetBalance } from "./balance";
import { getRPCClient, RPCClient } from "./client";
import { ISSUER_MNEMONIC } from "./testutils";

describe("Test getUserAssetBalance()", () => {
  it("Normal case", async () => {
    const client: RPCClient = await getRPCClient(ISSUER_MNEMONIC);
    const balance = await getUserAssetBalance(client, "USDS");
    const balanceValue = balance.toNumber();
    console.log(balanceValue);
    expect(balanceValue).toBeGreaterThan(1000);

    await client.disconnect();
  }, 120000);
});
