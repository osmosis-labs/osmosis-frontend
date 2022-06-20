FROM ubuntu as config

RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/osmosis-labs/LocalOsmosis.git
RUN mkdir -p /osmosis/.osmosisd/config && \
  mv ./LocalOsmosis/config /osmosis/.osmosisd/ && \
  mkdir -p /osmosis/.osmosisd/data && \
  mv ./LocalOsmosis/data /osmosis/.osmosisd/ && \
  mv ./LocalOsmosis/priv_validator_state.json /osmosis/.osmosisd/data

#enable swagger
RUN sed -i 's/swagger = false/swagger = true/g' /osmosis/.osmosisd/config/app.toml

# use debug version for utils, like sh
#FROM osmolabs/osmosis-dev:v9.0.0-debug
FROM osmolabs/osmosis:9.0.0

COPY --from=config /osmosis/.osmosisd/config /osmosis/.osmosisd/config
COPY --from=config /osmosis/.osmosisd/data /osmosis/.osmosisd/data
