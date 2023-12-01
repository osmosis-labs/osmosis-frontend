#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

PROTO_DIR="./chain-proto"
OSMOSIS_COMMIT_HASH="7b75d21015ba573f4e7876508e351e5122ff3c6b"
ICS23_COMMIT_HASH="f4deb054b697458e7f0aa353c2f45a365361e895"
COSMOS_SDK_VERSION="734f99fba785"
IBC_GO_VERSION="v4.5.0"
WASMD_VERSION="v0.31.0-osmo-v16"

rm -r -f .repos

mkdir -p .repos
mkdir -p "$PROTO_DIR"

# OSMOSIS PROTOS

# If the osmosis repo is there, fetch, otherwise clone sparse
git clone --filter=blob:none --sparse https://github.com/osmosis-labs/osmosis.git .repos/osmosis
# Checkout to Osmosis hash commit
git -C .repos/osmosis sparse-checkout set proto
git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH

# SDK PROTOS
# If the cosmos-sdk repo is there, fetch, otherwise clone sparse
git clone --filter=blob:none --sparse https://github.com/osmosis-labs/cosmos-sdk.git .repos/cosmos-sdk

# Checkout to Cosmos hash commit
git -C .repos/cosmos-sdk sparse-checkout set proto
git -C .repos/cosmos-sdk checkout $COSMOS_SDK_VERSION  

# IBC PROTOS
# If the ibc-go repo is there, fetch, otherwise clone sparse
git clone --filter=blob:none --sparse https://github.com/cosmos/ibc-go.git .repos/ibc-go

# Checkout to IBC hash commit
git -C .repos/ibc-go sparse-checkout set proto
git -C .repos/ibc-go checkout $IBC_GO_VERSION

# WASMD PROTOS

# Extract the Wasmd version from the go.mod file
# Clone or update the wasmd repo (osmosis-labs fork)
# If the wasmd repo is there, fetch, otherwise clone sparse
git clone --filter=blob:none --sparse https://github.com/osmosis-labs/wasmd.git .repos/wasmd

# Checkout to IBC hash commit
git -C .repos/wasmd sparse-checkout set proto
git -C .repos/wasmd checkout $WASMD_VERSION

# ICS23 PROTOS

# If the ibc-go repo is there, fetch, otherwise clone sparse
git clone --filter=blob:none --sparse https://github.com/cosmos/ics23.git .repos/ics23

# Checkout to IBC hash commit
git -C .repos/ics23 checkout $ICS23_COMMIT_HASH

git -C .repos/ics23 sparse-checkout set proto


# Remove query.proto files from the repos
find .repos -type f -name "query.proto" -exec rm -f {} \;