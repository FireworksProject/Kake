#!/bin/bash
flogout=$1
executable_path=$2
shift 2
$executable_path $* &> $flogout
