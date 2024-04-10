# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:debian as base
WORKDIR /usr/src/app

RUN apt update && apt install graphicsmagick -y

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY --chown=bun:bun package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY --chown=bun:bun . .

# [optional] tests & build
# ENV NODE_ENV=production
# ENV POSTGRES_HOST=localhost
# ENV POSTGRES_PORT=5432
# ENV POSTGRES_DATABASE=mproc_local
# ENV POSTGRES_USERNAME=postgres
# ENV POSTGRES_PASSWORD=postgres
# ENV SERVER_PORT=3000
# RUN bun test unit

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "--watch", "src/index.ts" ]

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tests ./tests

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
