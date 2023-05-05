# @osmosis-labs/proto-codecs

This package exports generated TypeScript libraries for encoding and decoding blockchain data, such as transactions. It also facilitates the conversion of Protobufs into TypeScript libraries for seamless data handling.

Generation consists of three steps:

1. Getting the proto files. Handled in `./scripts/get-proto.sh`
2. Generating the available packages to avoid outdated proto packages in the build. Handled in `./scripts/generate-package-types.ts`
3. Generate the TypeScript libraries using telescope. Handled in `./scripts/codegen.ts`

## Generation

To generate the TypeScript libraries, you can run the following command:

```bash
yarn generate
```

## Build

After generating files, you can build the package by running the following command:

```bash
yarn build
```

or you can run it in watch mode by running the following command:

```bash
yarn dev
```

## Getting Proto files

If you have not enabled permissions for running this bash script, you can run the following command:

```bash
chmod +x ./scripts/get-proto.sh
```

To get the proto files, you can run the following command:

```bash
yarn generate:proto
```

## Generating Available packages

We generate available packages to avoid including erroneous/outdated proto packages in the build.

To generate the available packages, you can run the following command:

```bash
yarn generate:packages
```

## Generating Proto Encoders

To generate the proto encoders, you can run the following command:

```bash
yarn generate:telescope
```
