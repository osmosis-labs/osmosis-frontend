# Docker

There are two different frontend flavours:

- Main
- Testnet

## Run main frontend

```bash
make frontend
```

Browse to [http://localhost:3000/](http://localhost:3000/)

## Run testnet

```bash
make testnet
```

Browse to [http://localhost:3001/](http://localhost:3001/)

## Run all

You can run them all with `make all`

## Build images

In case you need to build images only:

### Main

```bash
docker-compose build frontend
```

### Testnet

```bash
docker-compose build frontend-testnet
```
