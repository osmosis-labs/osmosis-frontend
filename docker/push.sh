SHA=$(git rev-parse --short HEAD)
ENVIRONMENT=${ENVIRONMENT:-testnet}

docker build -t osmolabs/osmosis-frontend:$SHA -t osmolabs/osmosis-frontend-$ENVIRONMENT:latest -f ./Dockerfile.$ENVIRONMENT ../
docker push osmolabs/osmosis-frontend-$ENVIRONMENT:$SHA
docker push osmolabs/osmosis-frontend-$ENVIRONMENT:latest

# frontier
ENVIRONMENT=frontier
docker build -t osmolabs/osmosis-frontend-$ENVIRONMENT:$SHA -t osmolabs/osmosis-frontend-$ENVIRONMENT:latest -f ./Dockerfile.$ENVIRONMENT ../
docker push osmolabs/osmosis-frontend-$ENVIRONMENT:$SHA
docker push osmolabs/osmosis-frontend-$ENVIRONMENT:latest

# main
docker build -t osmolabs/osmosis-frontend:$SHA -t osmolabs/osmosis-frontend:latest -f ./Dockerfile ../
docker push osmolabs/osmosis-frontend:$SHA
docker push osmolabs/osmosis-frontend:latest