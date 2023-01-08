# LiFi Daemon (Development tutorial)

## Install

```sh
$ make install
```

## Run tests

### Development

Run test:
```sh
$ yarn test:unit
$ yarn test:integ
```

### Run Locally
    export `ENV_CONFIG_PATH='env/beta.toml`
    ts-node src/main.ts

### Production

Build the source code to `.js`, result at `./dist`

```sh
$ yarn build
```

Run test:
```sh
$ yarn test:prod:unit
$ yarn test:prod:integ
```