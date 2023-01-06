import { BigNumber } from "@polymeshassociation/polymesh-sdk";

import { getRPCClient, RPCClient } from "./client";
import { getAccountAddress } from "./info";
import { ISSUER_MNEMONIC } from "./testutils";
import {
  affirmTransactionPendingInstruction,
  createVenue,
  getAccountCurrentNonce,
  getVenue,
  transferToken,
} from "./transfer";
import { sleep } from "./utils";

describe("Test transferToken()", () => {
  const cases: {
    mnemonic: string;
    venueId: number;
  }[] = [
    {
      mnemonic: ISSUER_MNEMONIC,
      venueId: 1005,
    },
    {
      mnemonic:
        "hole rough coyote paper doll bike entry feature light kick danger private",
      venueId: 1022,
    },
  ];

  describe.each(cases)(
    "Case of mnemonic [$mnemonic]",
    ({ mnemonic, venueId }) => {
      let client: RPCClient;

      beforeAll(async () => {
        client = await getRPCClient(mnemonic, true);
      }, 120000);

      afterAll(async () => {
        await client.disconnect();
      }, 120000);

      beforeEach(async () => {
        await sleep(1000);
      });

      it("Normal case", async () => {
        const receiverAddress =
          "0xe3b531d3635526277647eea277946386c4a8a9946f00e168bda109fbcc2cd6ce";

        const nonce = await getAccountCurrentNonce(client);

        const { txHash, instructionID } = await transferToken(client, {
          receiverAddress: receiverAddress,
          amount: 12.345678,
          tokenName: "USDS",
          nonce: nonce,
          venueID: new BigNumber(venueId),
        });

        console.log(`txHash: ${txHash}`);
        console.log(`instructionID: ${instructionID}`);

        expect(txHash).toBeDefined();
        expect(txHash.length).toBeGreaterThan(10);

        expect(instructionID).toBeDefined();
        expect(instructionID.length).toBeGreaterThan(0);
      }, 120000);

      it("Normal case with memo", async () => {
        const receiverAddress =
          "0xe3b531d3635526277647eea277946386c4a8a9946f00e168bda109fbcc2cd6ce";

        const nonce = await getAccountCurrentNonce(client);

        const { txHash, instructionID } = await transferToken(client, {
          receiverAddress: receiverAddress,
          amount: 5.345678,
          tokenName: "USDS",
          nonce: nonce,
          memo: "Testing transaction 1234",
          venueID: new BigNumber(venueId),
        });
        console.log(`txHash: ${txHash}`);
        console.log(`instructionID: ${instructionID}`);

        expect(txHash).toBeDefined();
        expect(txHash.length).toBeGreaterThan(10);

        expect(instructionID).toBeDefined();
        expect(instructionID.length).toBeGreaterThan(0);
      }, 120000);
    }
  );
});

describe("Test getAccountCurrentNonce()", () => {
  let client: RPCClient;

  beforeAll(async () => {
    client = await getRPCClient(ISSUER_MNEMONIC, true);
  }, 120000);

  afterAll(async () => {
    await client.disconnect();
  }, 120000);

  it("Normal case", async () => {
    const nonce = await getAccountCurrentNonce(client);
    expect(nonce).toBeDefined();
    expect(nonce.toNumber()).toBeGreaterThan(0);
  }, 120000);
});

describe("Test getVenue()", () => {
  let client: RPCClient;

  beforeAll(async () => {
    client = await getRPCClient(ISSUER_MNEMONIC);
  }, 120000);

  afterAll(async () => {
    await client.disconnect();
  }, 120000);

  it("Existing venueId", async () => {
    const venueId: BigNumber = new BigNumber(645);
    const venue = await getVenue(client, venueId);
    expect(venue).not.toBeNull();
    console.log(`VenueId: ${venue.id}`);
    expect(venue.id.toNumber()).toEqual(venueId.toNumber());
  }, 120000);

  it("Not existing venueId", async () => {
    const venueId: BigNumber = new BigNumber(67657546);

    try {
      await getVenue(client, venueId);
      expect(true).toBe(false);
    } catch (error) {
      expect((error as Error)?.message).toEqual("The Venue doesn't exist");
    }
  }, 120000);
});

describe("Test createVenue()", () => {
  let client: RPCClient;

  beforeAll(async () => {
    client = await getRPCClient(ISSUER_MNEMONIC);
  }, 120000);

  afterAll(async () => {
    await client.disconnect();
  }, 120000);

  it("Valid case", async () => {
    const venue = await createVenue(client);
    expect(venue).toBeTruthy();
    console.log(`VenueId: ${venue.id}`);
    expect(venue.id.toNumber()).toBeGreaterThan(1);
  }, 120000);
});

describe("Test affirmTransactionPendingInstruction()", () => {
  let receiverClient: RPCClient;

  beforeAll(async () => {
    receiverClient = await getRPCClient(
      "erosion endorse close impulse enforce minute slab group stick announce nest isolate"
    );
  }, 120000);

  afterAll(async () => {
    await receiverClient.disconnect();
  }, 120000);

  it("Affirmed transaction case", async () => {
    try {
      await affirmTransactionPendingInstruction(receiverClient, "3734");
      expect(true).toBe(false);
    } catch (error) {
      expect((error as Error)?.message).toEqual(
        "Not found a pending instruction with instructionID 3734"
      );
    }
  }, 120000);

  describe("New transaction case", () => {
    let senderClient: RPCClient;

    beforeAll(async () => {
      senderClient = await getRPCClient(ISSUER_MNEMONIC);
    }, 120000);

    afterAll(async () => {
      await senderClient.disconnect();
    }, 120000);

    it("Case 1", async () => {
      const receiverAddress = await getAccountAddress(receiverClient);
      const nonce = await getAccountCurrentNonce(senderClient);

      const { txHash, instructionID } = await transferToken(senderClient, {
        receiverAddress: receiverAddress,
        amount: 1.123,
        tokenName: "USDS",
        nonce: nonce,
        memo: "Testing transaction 1234",
        venueID: new BigNumber(1005), // 1005 is the Venue ID of the issuer account
      });
      console.log(`txHash: ${txHash}`);
      console.log(`instructionID: ${instructionID}`);

      const affirmationTxHash = await affirmTransactionPendingInstruction(
        receiverClient,
        instructionID
      );

      expect(affirmationTxHash).toBeTruthy();
      expect(affirmationTxHash.length).toBeGreaterThan(10);
    }, 120000);
  });

  it("Not existing instruction ID case", async () => {
    try {
      await affirmTransactionPendingInstruction(receiverClient, "not_existing");
      expect(true).toBe(false);
    } catch (error) {
      expect((error as Error)?.message).toEqual(
        "Not found a pending instruction with instructionID not_existing"
      );
    }
  }, 120000);
});
