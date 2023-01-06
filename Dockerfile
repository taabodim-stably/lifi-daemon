# syntax=docker/dockerfile:1.0.0-experimental
FROM node:16.15.0-alpine3.15 AS BUILD_IMAGE
LABEL stage=builder

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Copy source into the build environment
WORKDIR /usr/src
COPY .yarn/releases/yarn-3.3.0.cjs /usr/src/.yarn/releases/yarn-3.3.0.cjs
COPY .yarnrc.yml /usr/src
COPY package.json /usr/src
COPY yarn.lock /usr/src
COPY tsconfig.json /usr/src
COPY tsconfig-paths-bootstrap.js /usr/src
COPY babel.config.json /usr/src

# Install environment
# --inline-builds : Verbosely print the output of the build steps of dependencies
# --immutable     : Abort with an error exit code if the lockfile was to be modified
RUN yarn install --inline-builds --immutable --mode=skip-build

# Copy the source code
COPY src /usr/src/src

# Install again with build
RUN yarn install --inline-builds --immutable

# Build
RUN yarn build

# remove development dependencies
RUN npm prune --production

# ** removed node-prune as it removes some important dependencies of the @polkadot/types
# run node prune
# RUN apk add curl && curl -sf https://gobinaries.com/tj/node-prune | sh
# RUN node-prune

## this is stage two , where the app actually runs
FROM node:16.15.0-alpine3.15
WORKDIR /usr/src
RUN mkdir -p /usr/src

COPY --from=BUILD_IMAGE /usr/src/dist /usr/src
COPY --from=BUILD_IMAGE /usr/src/node_modules /usr/src/node_modules
COPY tsconfig.json /usr/src
COPY tsconfig-paths-bootstrap.js /usr/src
COPY scripts/docker-entrypoint/docker-entrypoint.sh /usr/src
COPY env /usr/src/env

# TODO: add test to check if the build output can be executed or not

ENV TSCONFIG_BASE_URL=.

ARG ENV_CONFIG_PATH
ENV ENV_CONFIG_PATH=$ENV_CONFIG_PATH

EXPOSE 5000

ENTRYPOINT [ "sh", "/usr/src/docker-entrypoint.sh" ]
