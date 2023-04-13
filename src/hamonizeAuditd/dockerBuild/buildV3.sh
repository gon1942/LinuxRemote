#!/bin/bash


file_path="/tmp/hamonizeProcBlock"
WORK_PATH=$(dirname $(realpath $0))
echo $WORK_PATH

docker build -f $WORK_PATH/DockerfileAuditdV3 -t audit_v3_build:1.0 .

docker run --rm -v /tmp:/tmp audit_v3_build:1.0

username=$(whoami)

sudo chown $username:$username $file_path

mv $file_path $WORK_PATH
