#! /bin/bash -x
set -e

GOLANG_URL=https://dl.google.com/go/go1.17.3.linux-amd64.tar.gz
GOLANG_FILENAME=go1.17.3.linux-amd64.tar.gz

if [ "aarch64" = $(uname -m) ]; then
  GOLANG_URL=https://dl.google.com/go/go1.17.3.linux-arm64.tar.gz
  GOLANG_FILENAME=go1.17.3.linux-arm64.tar.gz
fi

wget $GOLANG_URL
tar -xvf $GOLANG_FILENAME
mv go /usr/local
