#!/bin/bash

OUTDIR=build

# make sure directory actually exists
mkdir -p $OUTDIR

# build frontend
echo "Building frontend...."
cd service/app/
npm i
npm run build
cd ../../

echo "Building service...."
cd cmd/service/
go build -o ../../$OUTDIR/service
cd ../../
echo "Built $OUTDIR/service"

echo "Building cli...."
cd cmd/cli/
go build -o ../../$OUTDIR/cli
cd ../../
echo "Built $OUTDIR/cli"