## Overview

This module will used to load the TOML config from `env/*.toml`

## Add your config

Update the file `src/config/types.ts`

```typescript
import { Config as MyModuleConfig } from "modules/my-module/types/config";
import { Config as OtherModuleConfig } from "modules/other-module/types";

export interface RunConfig {
  readonly MyModule: MyModuleConfig;
  readonly OtherModule: OtherModuleConfig;
  readonly MyStuff: MyStuffConfig;
  ...
}

```

## Usage

Remember to set the `ENV_CONFIG_PATH='env/your_config.toml`

```typescript
import { getRungConfig, RunConfig } from "./config";

function main(): void {
  const config: RunConfig = getRungConfig();

  console.log(config.MyModule.BaseURL);
}

main();
```

## Usage (developing module)

Remember to set the `ENV_CONFIG_PATH='env/your_config.toml`

In the `env/my_config.toml`

```toml
[ModuleA]
field1 = "ddasds"
field2 = "gdfgdfgfd"
field3 = 12455

[ModuleB]
field1 = 654.3
field2 = "gdfgdfgfd"
```

In the `.ts` file

```typescript
interface MyTomlInterface {
  readonly ModuleA: {
    readonly field1: string;
    readonly field2: string;
    readonly field3: number;
  };
  readonly ModuleB: {
    readonly field1: number;
    readonly field2: string;
  };
}

function main(): void {
  const data = loadConfig<MyTomlInterface>(`env/my_config.toml`);
  console.log(data.ModuleA.field1);
  console.log(data.ModuleA.field2);
  console.log(data.ModuleA.field3);
  console.log(data.ModuleB.field1);
  console.log(data.ModuleB.field2);
}
```