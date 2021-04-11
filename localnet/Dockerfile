FROM ubuntu:20.04

RUN apt-get update && apt-get install -y git build-essential wget

RUN wget https://dl.google.com/go/go1.15.10.linux-amd64.tar.gz
RUN tar -xvf go1.15.10.linux-amd64.tar.gz
RUN mv go /usr/local

ENV GOROOT /usr/local/go
ENV PATH $GOPATH/bin:$GOROOT/bin:$PATH

RUN git clone https://github.com/osmosis-labs/osmosis

WORKDIR /osmosis

# Change the commit hash if you want.
RUN git fetch && git checkout 6c07c00688ecb0b1f2ead835dd60f7920e0e1dd5

# Build daemon.
RUN make build

WORKDIR /osmosis/build

RUN ./osmosisd init localnet --chain-id localnet-1

RUN sed -i 's#tcp://127.0.0.1:26657#tcp://0.0.0.0:26657#g' ~/.osmosisd/config/config.toml
RUN sed -i 's/cors_allowed_origins = \[\]/cors_allowed_origins = \["*"\]/g' ~/.osmosisd/config/config.toml
RUN sed -i 's/"stake"/"uosmo"/g' ~/.osmosisd/config/genesis.json
RUN sed -i 's/pruning = "syncable"/pruning = "nothing"/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/enable = false/enable = true/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/swagger = false/swagger = true/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/enabled-unsafe-cors = false/enabled-unsafe-cors = true/g' ~/.osmosisd/config/app.toml

RUN echo "high gain deposit chuckle hundred regular exist approve peanut enjoy comfort ride" | ./osmosisd keys add val --recover --keyring-backend test
RUN echo "health nest provide snow total tissue intact loyal cargo must credit wrist" | ./osmosisd keys add local1 --recover --keyring-backend test
RUN echo "canyon stone next tenant trial ugly slim luggage ski govern outside comfort" | ./osmosisd keys add local2 --recover --keyring-backend test
RUN echo "travel renew first fiction trick fly disease advance hunt famous absurd region" | ./osmosisd keys add local3 --recover --keyring-backend test

RUN ./osmosisd add-genesis-account $(./osmosisd keys show val -a --keyring-backend test) 10000000000uosmo,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local1 -a --keyring-backend test) 10000000000uosmo,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local2 -a --keyring-backend test) 10000000000uosmo,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local3 -a --keyring-backend test) 10000000000uosmo,10000000000uatom,10000000000ufoo,10000000000ubar

RUN ./osmosisd gentx val 10000000000uosmo --chain-id localnet-1 --keyring-backend test
RUN ./osmosisd collect-gentxs

EXPOSE 26657
EXPOSE 1317
EXPOSE 9090
CMD ./osmosisd start
