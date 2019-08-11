#!/bin/bash

# Runs a local webserver and chromium in app mode.
# The webserver is automatically stopped when chromium is closed.
# Usage:
# ./webapp.sh  # <-- will load index.html in the current directory
# ./webapp.sh path/to/myfile.html


TARGET=${1:-.}  # default value: .

if [[ -f "$TARGET" ]]; then
    # argument is file
    DIRECTORY=$(dirname $TARGET)
    URLPATH=$(basename $TARGET)
elif [[ -d "$TARGET" ]]; then
    # argument is directory
    DIRECTORY=$TARGET
    URLPATH=''
else
    echo "'$TARGET' does not exist." >&2
    exit 1
fi

echo "opening 'http://localhost:8000/$URLPATH' in directory '$DIRECTORY'"

cd "$DIRECTORY"

# https://stackoverflow.com/questions/28382669/running-background-process-webserver-for-just-as-long-as-other-process-test-s
python3 -m http.server 8000 --bind 127.0.0.1 &
PID=$!
sleep 0.5

if kill -0 $PID; then
    chromium-browser --disk-cache-dir=/dev/null --disk-cache-size=1 --app="http://localhost:8000/$URLPATH"
    kill $PID
else
    echo 'server failed to start' >&2
    exit 1
fi
