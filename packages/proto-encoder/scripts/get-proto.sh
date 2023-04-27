#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

PROTO_DIR="./chain-proto"
COSMOS_SDK_VERSION="v0.47.1"

OSMOSIS_COMMIT_HASH="ac133fdd73dbd27b8bc7b6d49049f5d594e771cb"
COSMOS_COMMIT_HASH="6ed904cdb75fe08a9310e7df49eaf9c5b2b64692"
IBC_COMMIT_HASH="10324f5bf6840892cd7bba8a40231fc52a8b1745"
WASMD_COMMIT_HASH="4c906d5a53a255c551d6ed981a548cffe47ae9f0"
ICS23_COMMIT_HASH="f4deb054b697458e7f0aa353c2f45a365361e895"

mkdir -p .repos
mkdir -p "$PROTO_DIR"

# SDK PROTOS

# If the cosmos-sdk repo is there, fetch, otherwise clone sparse
if [ -d ".repos/cosmos-sdk/.git" ]; then
  git -C .repos/cosmos-sdk fetch --all --tags
  git -C .repos/cosmos-sdk checkout $COSMOS_COMMIT_HASH
  git -C .repos/cosmos-sdk pull origin $COSMOS_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/cosmos/cosmos-sdk.git .repos/cosmos-sdk

  # Checkout to Cosmos hash commit
  git -C .repos/cosmos-sdk checkout $COSMOS_COMMIT_HASH  
  git -C .repos/cosmos-sdk sparse-checkout set proto
fi


# Move the protos folder to the desired destination
cp -R .repos/cosmos-sdk/proto/cosmos "$PROTO_DIR/cosmos" || true


# OSMOSIS PROTOS

# If the osmosis repo is there, fetch, otherwise clone sparse
if [ -d ".repos/osmosis/.git" ]; then
  git -C .repos/osmosis fetch --all --tags
  git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH
  git -C .repos/osmosis pull origin $OSMOSIS_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/osmosis-labs/osmosis.git .repos/osmosis

  # Checkout to Osmosis hash commit
  git -C .repos/osmosis checkout $OSMOSIS_COMMIT_HASH

  # Move to the osmosis repo directory and set sparse-checkout for the /proto folder
  git -C .repos/osmosis sparse-checkout set proto
fi

# Move the osmosis/proto/osmosis folder to the desired destination
cp -R .repos/osmosis/proto/osmosis "$PROTO_DIR/osmosis" || true

# IBC PROTOS

# If the ibc-go repo is there, fetch, otherwise clone sparse
if [ -d ".repos/ibc-go/.git" ]; then
  git -C .repos/ibc-go fetch --all --tags
  git -C .repos/ibc-go checkout $IBC_COMMIT_HASH
  git -C .repos/ibc-go pull origin $IBC_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/cosmos/ibc-go.git .repos/ibc-go

  # Checkout to IBC hash commit
  git -C .repos/ibc-go checkout $IBC_COMMIT_HASH

  git -C .repos/ibc-go sparse-checkout set proto
fi


# Move IBC Go proto files into the $PROTO_DIR/proto directory
cp -R .repos/ibc-go/proto/ibc "$PROTO_DIR/ibc" || true


# WASMD PROTOS

# Extract the Wasmd version from the go.mod file
WASMD_VERSION=$(awk '/github.com\/osmosis-labs\/wasmd/ {print $4}' .repos/osmosis/go.mod)

# Clone or update the wasmd repo (osmosis-labs fork)
# If the wasmd repo is there, fetch, otherwise clone sparse
if [ -d ".repos/wasmd/.git" ]; then
  git -C .repos/wasmd fetch --all --tags
  git -C .repos/wasmd checkout $WASMD_COMMIT_HASH
  git -C .repos/wasmd pull origin $WASMD_COMMIT_HASH
else
  git clone --filter=blob:none --sparse https://github.com/osmosis-labs/wasmd.git .repos/wasmd

  # Checkout to IBC hash commit
  git -C .repos/wasmd checkout $WASMD_COMMIT_HASH

  git -C .repos/wasmd sparse-checkout set proto
fi


# Move Wasmd proto files into the $PROTO_DIR/proto directory
mkdir -p $PROTO_DIR/cosmwasm/
cp -R .repos/wasmd/proto/cosmwasm/wasm/v1/* "$PROTO_DIR/cosmwasm/" || true

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


# Move IBC Go proto files into the $PROTO_DIR/proto directory
cp -R .repos/ics23/proto/ibc "$PROTO_DIR/ics23" || true
