#!/bin/bash
ACTIVATE=$1/bin/activate
DIR="$(cd "$(dirname "$0")" && pwd)"
if ! [ -f $ACTIVATE ]; then
    echo 'invalid Mozilla Addon SDK path: '$1 > $3
    echo 'Program terminated unsuccessfully.' >> $3
    exit 1
fi
if ! [ -f $2 ]; then
    echo 'invalid Firefox binary path: '$2 > $3
    echo 'Program terminated unsuccessfully.' >> $3
    exit 1
fi
cd $1
source $ACTIVATE
cd $DIR
cfx test --verbose -b $2 &> $3
deactivate

