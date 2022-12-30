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
go build -tags netgo -ldflags '-w' -o ../../$OUTDIR/service
cd ../../
echo "Built $OUTDIR/service"

echo "Building cli...."
cd cmd/cli/
go build -tags netgo -ldflags '-w' -o ../../$OUTDIR/cli
cd ../../
echo "Built $OUTDIR/cli"