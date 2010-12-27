#!/bin/bash
EXPATH=$1
OUT_PIPE=$2
ERR_LOG=$3
if ! [ -f $EXPATH ]; then
    echo "not a file: \"$EXPATH\"" 1> $ERR_LOG
    exit 1
fi
if ! [ -x $EXPATH ]; then
    echo "execute permission denied: \"$EXPATH\"" 1> $ERR_LOG
    exit 1
fi
shift 3
$EXPATH $* 2>$ERR_LOG 1>$OUT_PIPE
exit $?

