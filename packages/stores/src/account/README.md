# Account Store

## Creating Messages

1. Navigate to the `proto-codecs` package in our repository. You can find it [here](https://github.com/osmosis-labs/osmosis-frontend/blob/c343a93f2fc12d07eeaa1a82400304a09ac6901e/packages/proto-codecs).

2. Update the `get-proto.sh` script. You'll need to point it to the Osmosis commit that contains the messages you want. You can find this script [here](https://github.com/osmosis-labs/osmosis-frontend/blob/c343a93f2fc12d07eeaa1a82400304a09ac6901e/packages/proto-codecs/scripts/get-proto.sh).

3. Once you've made your changes, run the following commands to generate and build the project:

```bash
yarn generate && yarn build
```

## Adding a Message to the Account Store

1. Go to the relevant account based on the repo origin. An example could be the osmosis account located [here](https://github.com/osmosis-labs/osmosis-frontend/blob/c343a93f2fc12d07eeaa1a82400304a09ac6901e/packages/stores/src/account/osmosis/types.ts).

2. Insert the message composers from the code you generated earlier.

3. In the `sendMsg` method of the relevant account (for instance, in the osmosis account, find it [here](https://github.com/osmosis-labs/osmosis-frontend/blob/c343a93f2fc12d07eeaa1a82400304a09ac6901e/packages/stores/src/account/osmosis/index.ts)), use the messageComposer to create a message compatible with both 'amino' and 'proto' formats.
