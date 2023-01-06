import fs from "fs";
import toml from "toml";

/**
 * Load TOML config object
 *
 * @param tomlFilePath config file path
 * @returns the TOML object
 */
export function loadConfig<TargetInterface>(
  tomlFilePath: string
): TargetInterface {
  console.log(`Loading TOML config from ${tomlFilePath}`);
  const configString = fs.readFileSync(tomlFilePath, "utf-8");
  return toml.parse(configString) as TargetInterface;
}
