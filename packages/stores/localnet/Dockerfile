FROM ubuntu:20.04 as wasmBuilder

RUN apt-get update && apt-get install -y git build-essential curl

# Install rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH /root/.cargo/bin:$PATH

# I am using M1 mac.
# But cosmwasm doesn't support arm64 yet.
# First, to build osmosisd, try to build libwasmvm on arm64. I don't know if it will actually work.
# We have to use cranelift as singlepass doesn't support arm64.
# Once it works, I expect it to be usable for testing purposes, even if it cannot be used in production.
RUN git clone https://github.com/CosmWasm/wasmvm
WORKDIR /wasmvm
# Make sure it matches the version required by osmosisd
RUN git fetch && git checkout v1.0.0-beta5

WORKDIR /wasmvm/libwasmvm
RUN sed -i 's#cosmwasm-vm.+\["staking", "stargate", "iterator"\]#\0\["staking", "stargate", "iterator", "cranelift"\]#g' Cargo.toml
RUN cargo build --release
RUN cp target/release/libwasmvm.so /lib/libwasmvm.so

FROM ubuntu:20.04

RUN apt-get update && apt-get install -y git build-essential wget
RUN wget https://github.com/mikefarah/yq/releases/download/v4.9.3/yq_linux_amd64 -O /usr/bin/yq && chmod +x /usr/bin/yq

COPY install-golang.sh install-golang.sh

RUN sh install-golang.sh

ENV GOROOT /usr/local/go
ENV GOPATH /go
ENV GOBIN /go/bin
ENV PATH $GOBIN:$GOROOT/bin:$PATH

COPY --from=wasmBuilder /lib/libwasmvm.so /lib/libwasmvm.so

RUN git clone https://github.com/osmosis-labs/osmosis

WORKDIR /osmosis

# Change the commit hash if you want.
RUN git fetch && git checkout 099bc9f9083fd138311e2b0564a26ca97a196888

# Build daemon.
RUN make build

WORKDIR /osmosis/build

RUN ./osmosisd init localnet --chain-id localnet-1

# epochs 모듈에 hour만 존재하도록 만든다.
RUN yq eval 'del(.app_state.epochs.epochs.[1])' ~/.osmosisd/config/genesis.json \
    | yq eval '.app_state.epochs.epochs.[0].identifier = "hour"' - \
    | yq eval '.app_state.epochs.epochs.[0].epoch_counting_started = true' - \
    | yq eval '.app_state.epochs.epochs.[0].duration = "3600s"' - \
    | yq eval '.app_state.poolincentives.distr_info.total_weight = "0"' - \
    | yq eval '.app_state.poolincentives.distr_info.records = []' - \
    | yq eval '.app_state.staking.params.unbonding_time = "25200s"' - \
    | yq eval '.app_state.gov.deposit_params.min_deposit.[0].denom = "uosmo"' - \
    | yq eval '.app_state.gov.deposit_params.min_deposit.[0].amount = "1"' - \
    | yq eval '.app_state.gov.voting_params.voting_period = "60s"' - \
    | yq eval '.app_state.gov.tally_params.quorum = "0.000000003340000000"' - \
    | yq eval '.app_state.gov.tally_params.threshold = "0.000000003340000000"' - \
    | yq eval '' -j - \
    > ~/.osmosisd/config/genesis.tmp.json
RUN mv ~/.osmosisd/config/genesis.tmp.json ~/.osmosisd/config/genesis.json

RUN sed -i 's#tcp://127.0.0.1:26657#tcp://0.0.0.0:26657#g' ~/.osmosisd/config/config.toml
RUN sed -i 's/cors_allowed_origins = \[\]/cors_allowed_origins = \["*"\]/g' ~/.osmosisd/config/config.toml
RUN sed -i 's/timeout_commit = "5s"/timeout_commit = "1s"/g' ~/.osmosisd/config/config.toml
RUN sed -i 's/seeds = ".*"/seeds = ""/g' ~/.osmosisd/config/config.toml
RUN sed -i 's/"stake"/"uosmo"/g' ~/.osmosisd/config/genesis.json
RUN sed -i 's/pruning = "default"/pruning = "nothing"/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/enable = false/enable = true/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/swagger = false/swagger = true/g' ~/.osmosisd/config/app.toml
RUN sed -i 's/enabled-unsafe-cors = false/enabled-unsafe-cors = true/g' ~/.osmosisd/config/app.toml

# 데브넷 체인에서는 풀 리워드 분배가 hour로 발생하도록 만든다.
RUN sed -i 's/"distr_epoch_identifier": "week"/"distr_epoch_identifier": "hour"/g' ~/.osmosisd/config/genesis.json
RUN sed -i 's/"epoch_identifier": "week"/"epoch_identifier": "hour"/g' ~/.osmosisd/config/genesis.json

RUN echo "high gain deposit chuckle hundred regular exist approve peanut enjoy comfort ride" | ./osmosisd keys add val --recover --keyring-backend test
RUN echo "health nest provide snow total tissue intact loyal cargo must credit wrist" | ./osmosisd keys add local1 --recover --keyring-backend test
RUN echo "canyon stone next tenant trial ugly slim luggage ski govern outside comfort" | ./osmosisd keys add local2 --recover --keyring-backend test
RUN echo "travel renew first fiction trick fly disease advance hunt famous absurd region" | ./osmosisd keys add local3 --recover --keyring-backend test

RUN ./osmosisd add-genesis-account $(./osmosisd keys show val -a --keyring-backend test) 100000000000000uosmo,10000000000uion,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local1 -a --keyring-backend test) 100000000000000uosmo,10000000000uion,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local2 -a --keyring-backend test) 100000000000000uosmo,10000000000uion,10000000000uatom,10000000000ufoo,10000000000ubar
RUN ./osmosisd add-genesis-account $(./osmosisd keys show local3 -a --keyring-backend test) 100000000000000uosmo,10000000000uion,10000000000uatom,10000000000ufoo,10000000000ubar

# COPY gentx /root/.osmosisd/config/gentx

RUN ./osmosisd gentx val 10000000000uosmo --chain-id localnet-1 --keyring-backend test
RUN ./osmosisd collect-gentxs

RUN sed -i 's/persistent_peers = ".*"/persistent_peers = ""/g' ~/.osmosisd/config/config.toml

EXPOSE 26657
EXPOSE 1317
EXPOSE 9090
CMD ./osmosisd start --trace
