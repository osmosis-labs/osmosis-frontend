#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Build the docker image first.
sudo docker build --tag osmosis/localnet "$DIR"/../localnet

# Make sure that previous container not exist.
sudo docker rm --force osmosis_localnet

# Start container as daemon with some ports opening.
sudo docker run -d -p 1317:1317 -p 26657:26657 -p 9090:9090 --name osmosis_localnet osmosis/localnet

echo "Validator mnemonic: high gain deposit chuckle hundred regular exist approve peanut enjoy comfort ride"
echo "Account1 mnemonic: health nest provide snow total tissue intact loyal cargo must credit wrist"
echo "Account2 mnemonic: canyon stone next tenant trial ugly slim luggage ski govern outside comfort"
echo "Account2 mnemonic: travel renew first fiction trick fly disease advance hunt famous absurd region"
echo "Each account has the balances (10000000000uosmo,10000000000uatom,10000000000ufoo,10000000000ubar)"

echo "Docker container is running on \"osmosis_localnet\""
echo "After testing, to remove existing container, run \"sudo docker rm --force osmosis_localnet\""
