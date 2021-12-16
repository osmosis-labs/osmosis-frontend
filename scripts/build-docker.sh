#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

docker build --tag osmosis/frontend -f "$DIR"/../deploy/Dockerfile "$DIR"/..
