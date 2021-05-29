FROM node:14.17.0-alpine3.10

ADD / /frontend/

WORKDIR /frontend

# node 이미지에 yarn이 이미 설치되어 있다고 한다.
RUN yarn install --frozen-lockfile
RUN yarn build

EXPOSE 8080

CMD yarn serve
