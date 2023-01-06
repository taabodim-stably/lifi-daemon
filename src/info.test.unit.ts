import { getRPCClient, RPCClient } from "./client";
import { getAccountAddress } from "./info";
import { ISSUER_MNEMONIC } from "./testutils";

describe("Test getAccountAddress()", () => {
  let client: RPCClient;
  beforeAll(async () => {
    client = await getRPCClient(ISSUER_MNEMONIC);
  });
  afterAll(async () => {
    await client.disconnect();
  });

  it("Normal case", async () => {
    const address = await getAccountAddress(client);
    console.log(address);
    expect(address).toEqual(
      "0x8ea936ac28897a1a93669790776d9bc8263a0b0418e23f143446b1ac83d815f9"
    );
  }, 120000);
});
