FROM node:14.17.0-alpine3.10

ADD /prod /prod

# Yarn is also pre-installed in the node alpine image.
RUN yarn global add http-server

EXPOSE 8080
CMD http-server --address 0.0.0.0 --port 8080 --proxy http://localhost:8080? /prod
