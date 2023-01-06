import { getRunConfig } from "./config";
import { startServer } from "./server";

/**
 * Main entrypoint
 */
(async (): Promise<void> => {
  const port = getRunConfig().BindingPort;

  if (!port) {
    throw Error("Missing getRunConfig().BindingPort");
  }

  await startServer(port);
})();
