# Todo list

## Features

- [ ] Add `postinstall` script for `package.json` to only pickup files, directories in `files` (declared in `package.json`)
  - The reason is because `yarn` only uses `files` for `yarn publish` and `yarn pack` commands
- [ ] Update test cases

## Linting

- [ ] Add formatter for `json` files
  - Do not use `eslint-plugin-json-format` as it cannot parse `package.json` and some other `json` files
  - It seems like a bug of this plugin