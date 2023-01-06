import { loadConfig } from "./loader";
import { RunConfig } from "./types";

export { RunConfig } from "./types";

var runConfig: RunConfig;

/**
 * Return the loaded runConfig object
 *
 * @returns RunConfig object
 */
export function getRunConfig(): RunConfig {
  if (!runConfig) {
    const configPath = process.env.ENV_CONFIG_PATH;

    if (!configPath) {
      throw new Error(`Missing process.env.ENV_CONFIG_PATH`);
    }
    runConfig = loadConfig<RunConfig>(configPath);
  }
  return runConfig;
}
