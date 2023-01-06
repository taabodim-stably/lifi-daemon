# Polymesh Client Service (Development tutorial)

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

## Interact with remote VPS

Specify the required variables in `.env.local`

```
SSH_PATH=
REMOTE_USER=
REMOTE_HOST=
REMOTE_WORKDIR=
```

Run the following command to login to the host:
```sh
$ make remote.connect
```

Run the following command to upload file to host:
```sh
$ make remote.upload path=./your_file.abc
```
