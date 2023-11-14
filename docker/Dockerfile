FROM node:18 as build

WORKDIR /app

COPY turbo.json lerna.json package.json tsconfig.json yarn.lock /app/
COPY packages /app/packages/

RUN yarn
RUN yarn build

FROM node:18-alpine3.17

WORKDIR /app
COPY --from=build /app .

EXPOSE 3000
CMD [ "yarn", "start" ]
