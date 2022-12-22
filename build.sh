#!/bin/bash

OUTDIR=build

# make sure directory actually exists
mkdir -p $OUTDIR

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