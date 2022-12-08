# Docker

There are three different frontend flavours:

- Main 
- Frontier 
- Testnet

## Run main frontend

```bash
make frontend
```

Browse to [http://localhost:3000/](http://localhost:3000/)

## Run frontier

```bash
make frontier
```

Browse to [http://localhost:3001/](http://localhost:3001/)

## Run testnet

```bash
make testnet
```

Browse to [http://localhost:3002/](http://localhost:3002/)

## Run all

You can run them all with `make all`

## Build images

In case you need to build images only:

### Main

```bash
docker-compose build frontend
```

### Frontier

```bash
docker-compose build frontend-frontier
```

### Testnet

```bash
docker-compose build frontend-testnet
```
