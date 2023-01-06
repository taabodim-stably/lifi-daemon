const requireJSON5 = require("require-json5");
const tsConfigPaths = require("tsconfig-paths");

const tsConfig = requireJSON5("./tsconfig.json");

// Either absolute or relative path. If relative it's resolved to current working directory.
const baseUrl = `${process.env.TSCONFIG_BASE_URL}`;
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
