#!/bin/bash
activate_sdk=$1/bin/activate
kake_dir="$(cd "$(dirname "$0")" && pwd)"
if ! [ -f $activate_sdk ]; then
    echo 'invalid Mozilla Addon SDK path: '$1
    echo 'Program terminated unsuccessfully.'
    exit 1
fi
cd $1
source $activate_sdk
cd $kake_dir
if [ -z "$2" ]; then
    cfx test --verbose
    deactivate
    exit 0
else
    if [ -f $2 ]; then
        cfx test --verbose -b $2
        exit 0
    else
        echo 'invalid Firefox binary path: '$2
        echo 'Program terminated unsuccessfully.'
        exit 1
    fi
fi

