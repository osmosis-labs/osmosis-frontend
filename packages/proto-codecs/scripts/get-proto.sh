#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

GREEN='\033[0;32m' # Green color
NC='\033[0m' # No Color

PROTO_DIR="./chain-proto"
OSMOSIS_COMMIT_HASH="173a8c1c11d577e8f0138a0b003776e36a6d73c8"

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
COSMOS_SDK_VERSION=$(awk -F '=>' '/github.com\/osmosis-labs\/cosmos-sdk/ {print $2}' .repos/osmosis/go.mod | awk '{print $NF}' | tr -d '\n')
echo -e "${GREEN}COSMOS_SDK_VERSION: $COSMOS_SDK_VERSION${NC}"

git clone --filter=blob:none --sparse https://github.com/osmosis-labs/cosmos-sdk.git .repos/cosmos-sdk

# Checkout to Cosmos hash commit
git -C .repos/cosmos-sdk sparse-checkout set proto
git fetch --all --tags
git -C .repos/cosmos-sdk checkout $COSMOS_SDK_VERSION  


# IBC PROTOS

IBC_GO_VERSION=$(awk '/github.com\/cosmos\/ibc-go/ {print $2}' .repos/osmosis/go.mod)
echo -e "${GREEN}IBC_GO_VERSION: $IBC_GO_VERSION${NC}"

git clone --filter=blob:none --sparse https://github.com/cosmos/ibc-go.git .repos/ibc-go

# Checkout to IBC hash commit
git -C .repos/ibc-go sparse-checkout set proto
git fetch --all --tags
git -C .repos/ibc-go checkout $IBC_GO_VERSION

# WASMD PROTOS

# Extract the Wasmd version from the go.mod file
WASMD_VERSION=$(awk '/github.com\/osmosis-labs\/wasmd/ {print $4}' .repos/osmosis/go.mod)
echo -e "${GREEN}WASMD_VERSION: $WASMD_VERSION${NC}"

# TROUBLESHOOTING
# if this fails, reach out to chain team to tag the replaced commits instead of using the commit directly - 

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