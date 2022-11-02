FROM node:14.19.1 as build

WORKDIR /usr/src/app

COPY . .

RUN npm install -g npm@8.10.0

RUN yarn
RUN yarn build

FROM node:14.19.1-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

EXPOSE 3000

CMD [ "yarn", "start" ]