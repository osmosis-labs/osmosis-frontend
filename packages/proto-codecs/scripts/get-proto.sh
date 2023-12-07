#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

PROTO_DIR="./chain-proto"
OSMOSIS_COMMIT_HASH="42b2aced91f09a640898f44e4402d5321b7dc451"

ICS23_COMMIT_HASH="f4deb054b697458e7f0aa353c2f45a365361e895"

rm -r -f .repos

mkdir -p .repos
mkdir -p "$PROTO_DIR"

# OSMOSIS PROTOS

git clone --filter=blob:none --sparse https://github.com/osmosis-labs/osmosis.git .repos/osmosis

# Checkout to Osmosis hash commit
git -C .repos/osmosis sparse-checkout set proto
git fetch --all --tags
git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH


# SDK PROTOS
COSMOS_SDK_VERSION=$(awk '/github.com\/cosmos\/cosmos-sdk/ {print $2}' .repos/osmosis/go.mod | tr -d '=> ')

git clone --filter=blob:none --sparse https://github.com/cosmos/cosmos-sdk.git .repos/cosmos-sdk

# Checkout to Cosmos hash commit
git -C .repos/cosmos-sdk sparse-checkout set proto
git fetch --all --tags
git -C .repos/cosmos-sdk checkout $COSMOS_SDK_VERSION  


# IBC PROTOS

IBC_GO_VERSION=$(awk '/github.com\/cosmos\/ibc-go/ {print $2}' .repos/osmosis/go.mod)

git clone --filter=blob:none --sparse https://github.com/cosmos/ibc-go.git .repos/ibc-go

# Checkout to IBC hash commit
git -C .repos/ibc-go sparse-checkout set proto
git fetch --all --tags
git -C .repos/ibc-go checkout $IBC_GO_VERSION


# WASMD PROTOS

# Extract the Wasmd version from the go.mod file
WASMD_VERSION=$(awk '/github.com\/osmosis-labs\/wasmd/ {print $4}' .repos/osmosis/go.mod)



git clone --filter=blob:none --sparse https://github.com/osmosis-labs/wasmd.git .repos/wasmd

# Checkout to IBC hash commit
git -C .repos/wasmd sparse-checkout set proto
git fetch --all --tags
git -C .repos/wasmd checkout $WASMD_VERSION

# ICS23 PROTOS

git clone --filter=blob:none --sparse https://github.com/cosmos/ics23.git .repos/ics23

# Checkout to IBC hash commit
git -C .repos/ics23 sparse-checkout set proto
git fetch --all --tags
git -C .repos/ics23 checkout $ICS23_COMMIT_HASH

# Remove query.proto files from the repos
find .repos -type f -name "query.proto" -exec rm -f {} \;