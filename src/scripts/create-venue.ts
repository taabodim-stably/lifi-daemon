import { getRPCClient } from "@root/client";
import { createVenue } from "@root/transfer";
import { loadFile } from "@root/utils";

/**
 * Entrypoint
 */
async function main(): Promise<void> {
  const mnemonic = loadFile("./secrets/issuer-mnemonic.txt");
  const client = await getRPCClient(mnemonic);

  try {
    const res = await createVenue(client);
    console.log(`VenueID: ${res.id}`);
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error, null, 4)}`);
  }

  await client.disconnect();
}

main();
