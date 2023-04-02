#!/usr/bin/env bash

cd "$(dirname "$0")"

PORT=9000 subway --config configs/acala.yml &
PORT=9001 subway --config configs/karura.yml &
PORT=9002 subway --config configs/kusama.yml &
PORT=9003 subway --config configs/polkadot.yml &
PORT=9004 subway --config configs/statemine.yml &
PORT=9005 subway --config configs/statemint.yml &
PORT=9006 subway --config configs/basilisk.yml &
PORT=9007 subway --config configs/hydraDX.yml &
PORT=9008 subway --config configs/moonbeam.yml &
PORT=9009 subway --config configs/moonriver.yml &

trap 'kill $(jobs -p)' EXIT

wait
