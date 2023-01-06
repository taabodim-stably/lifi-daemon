import { getRPCClient, RPCClient } from "./client";
import { ISSUER_MNEMONIC, ISSUER_MNEMONIC_2 } from "./testutils";

describe("Test getRPCClient()", () => {
  it("force_new=false case", async () => {
    // Make sure if using the same mnemonic, the same object will be returned (not re-created)
    const client1: RPCClient = await getRPCClient(ISSUER_MNEMONIC);
    expect(client1).not.toBeNull();

    const client2: RPCClient = await getRPCClient(ISSUER_MNEMONIC);
    expect(client2).not.toBeNull();

    expect(client1 === client2).toBe(true);

    // For a new mnemonic, it must create a new object
    const client3: RPCClient = await getRPCClient(ISSUER_MNEMONIC_2);
    expect(client3).not.toBeNull();

    expect(client1 === client3).toBe(false);

    await Promise.all([client1.disconnect(), client3.disconnect()]);
  }, 120000);

  it("force_new=true case", async () => {
    // Even using the same mnemonic, it will always create a new object
    const client1: RPCClient = await getRPCClient(ISSUER_MNEMONIC, true);
    expect(client1).not.toBeNull();

    const client2: RPCClient = await getRPCClient(ISSUER_MNEMONIC, true);
    expect(client2).not.toBeNull();

    expect(client1 === client2).toBe(false);

    await Promise.all([client1.disconnect(), client2.disconnect()]);
  }, 120000);
});
