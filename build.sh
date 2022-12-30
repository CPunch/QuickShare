#!/bin/bash
OUTDIR=build

# make sure directory actually exists
mkdir -p $OUTDIR

# build everything
echo "Building frontend...."
cd service/app/
npm i
npm run build
cd ../../

echo "Building service...."
cd cmd/service/
CGO_ENABLED=0 go build -a -tags netgo -ldflags '-w' -o ../../$OUTDIR/service
cd ../../
echo "Built $OUTDIR/service"

echo "Building cli...."
cd cmd/cli/
CGO_ENABLED=0 go build -a -tags netgo -ldflags '-w' -o ../../$OUTDIR/cli
cd ../../
echo "Built $OUTDIR/cli"