import express from "express";

import {
  executeQuote,
  demoStaging,
  healthCheckRoute, getTxnStatus,
} from "./route";
import {WalletHolder} from "@root/wallet";

/**
 * Start the service
 *
 * @param port the binding port of the service
 */
export async function startServer(port: number): Promise<void> {
  const app = express();

  app.use(express.json());

  // define the instance variable
  app.locals.FromWallet = WalletHolder.getInstance().wallet;

  // app.use((req, _, next) => {
  //   // @ts-ignore
  //   // req.FromWallet = app.locals.FromWallet;
  //   // @ts-ignore
  //   // req.mnemonic = process.env.MNEMONIC;
  //   next();
  // });

  app.get("/lifi-daemon/demostaging", demoStaging);
  app.get("/lifi-daemon/execute-quote", executeQuote);
  app.get("/lifi-daemon/txn-status", getTxnStatus);

  // For ECS load balancer healthcheck
  app.get("/lifi-daemon/healthcheck", healthCheckRoute);

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}


