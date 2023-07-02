#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

PROTO_DIR="./chain-proto"

OSMOSIS_COMMIT_HASH="f9b3cc10422b12d17b3620c5e1004628ca39c943"
ICS23_COMMIT_HASH="f4deb054b697458e7f0aa353c2f45a365361e895"

mkdir -p .repos
mkdir -p "$PROTO_DIR"

# OSMOSIS PROTOS

# If the osmosis repo is there, fetch, otherwise clone sparse
if [ -d ".repos/osmosis/.git" ]; then
  git -C .repos/osmosis fetch --all --tags
  git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH
  git -C .repos/osmosis pull origin $OSMOSIS_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/osmosis-labs/osmosis.git .repos/osmosis

  # Checkout to Osmosis hash commit
  git -C .repos/osmosis sparse-checkout set proto
  git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH
fi

# SDK PROTOS
COSMOS_SDK_VERSION=$(awk '/github.com\/cosmos\/cosmos-sdk/ {print $2}' .repos/osmosis/go.mod | tr -d '=> ')

# If the cosmos-sdk repo is there, fetch, otherwise clone sparse
if [ -d ".repos/cosmos-sdk/.git" ]; then
  git -C .repos/cosmos-sdk fetch --all --tags
  git -C .repos/cosmos-sdk checkout $COSMOS_SDK_VERSION
  git -C .repos/cosmos-sdk pull origin $COSMOS_SDK_VERSION
else
  git clone --filter=blob:none --sparse https://github.com/cosmos/cosmos-sdk.git .repos/cosmos-sdk

  # Checkout to Cosmos hash commit
  git -C .repos/cosmos-sdk sparse-checkout set proto
  git -C .repos/cosmos-sdk checkout $COSMOS_SDK_VERSION  
fi

# IBC PROTOS

IBC_GO_VERSION=$(awk '/github.com\/cosmos\/ibc-go/ {print $2}' .repos/osmosis/go.mod)

# If the ibc-go repo is there, fetch, otherwise clone sparse
if [ -d ".repos/ibc-go/.git" ]; then
  git -C .repos/ibc-go fetch --all --tags
  git -C .repos/ibc-go checkout $IBC_GO_VERSION
  git -C .repos/ibc-go pull origin $IBC_GO_VERSION
else
  git clone --filter=blob:none --sparse https://github.com/cosmos/ibc-go.git .repos/ibc-go

  # Checkout to IBC hash commit
  git -C .repos/ibc-go sparse-checkout set proto
  git -C .repos/ibc-go checkout $IBC_GO_VERSION
fi

# WASMD PROTOS

# Extract the Wasmd version from the go.mod file
WASMD_VERSION=$(awk '/github.com\/osmosis-labs\/wasmd/ {print $4}' .repos/osmosis/go.mod)
# Clone or update the wasmd repo (osmosis-labs fork)
# If the wasmd repo is there, fetch, otherwise clone sparse
if [ -d ".repos/wasmd/.git" ]; then
  git -C .repos/wasmd fetch --all --tags
  git -C .repos/wasmd checkout $WASMD_VERSION
  git -C .repos/wasmd pull origin $WASMD_VERSION
else
  git clone --filter=blob:none --sparse https://github.com/osmosis-labs/wasmd.git .repos/wasmd

  # Checkout to IBC hash commit
  git -C .repos/wasmd sparse-checkout set proto
  git -C .repos/wasmd checkout $WASMD_VERSION
fi

# ICS23 PROTOS

# If the ibc-go repo is there, fetch, otherwise clone sparse
if [ -d ".repos/ics23/.git" ]; then
  git -C .repos/ics23 fetch --all --tags
  git -C .repos/ics23 checkout $ICS23_COMMIT_HASH
  git -C .repos/ics23 pull origin $ICS23_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/cosmos/ics23.git .repos/ics23

  # Checkout to IBC hash commit
  git -C .repos/ics23 checkout $ICS23_COMMIT_HASH

  git -C .repos/ics23 sparse-checkout set proto
fi
