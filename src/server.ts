import express from "express";

import {
  affirmPendingInstructionRoute,
  createVenueRoute, demo, demoStaging,
  getAccountAddressRoute,
  getAccountCurrentNonceRoute,
  getUserAssetBalanceRoute,
  healthCheckRoute,
} from "./route";

/**
 * Start the service
 *
 * @param port the binding port of the service
 */
export async function startServer(port: number): Promise<void> {
  const app = express();

  app.use(express.json());

  app.get("/lifi-daemon/demostaging", demoStaging);
  app.get("/lifi-daemon/demo", demo);

  app.post("/lifi-daemon/get_user_asset_balance", getUserAssetBalanceRoute);

  app.post("/lifi-daemon/get_current_nonce", getAccountCurrentNonceRoute);

  app.post("/lifi-daemon/get_account_address", getAccountAddressRoute);

  app.post("/lifi-daemon/create_venue", createVenueRoute);

  app.post(
    "/lifi-daemon/affirm_pending_instruction",
    affirmPendingInstructionRoute
  );

  // For ECS load balancer healthcheck
  app.get("/lifi-daemon/healthcheck", healthCheckRoute);

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}
