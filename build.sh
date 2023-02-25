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
go build -tags netgo -o ../../$OUTDIR/service
cd ../../
echo "Built $OUTDIR/service"
