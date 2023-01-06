import { readFileSync } from "fs";

import { getRunConfig } from "./config";

/**
 * Load content string from a file
 *
 * @param filePath the input file path
 * @returns file content string
 */
export function loadFile(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

/**
 * Load object from a JSON file
 *
 * @param filePath the input file path
 * @returns output object
 */
export function loadJsonFromFile(filePath: string): any {
  const data = loadFile(filePath);
  return JSON.parse(data);
}

/**
 * Sleep function
 *
 * @param ms sleep duration (in miliseconds)
 * @returns nothing
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Get the token decimal (3, 6, 18,...) of a security token
 *
 * @param assetTicker the asset ticker (USDS, ...)
 * @returns the token decimal value
 */
export function getTokenDecimal(assetTicker: string): number {
  if (assetTicker === "USDS") {
    return getRunConfig().SecurityToken.USDS.TokenDecimal;
  }
  throw Error(`Not support assetTicker: ${assetTicker}`);
}
