#!/bin/bash


file_path="/tmp/hamonizeProcV2"
WORK_PATH=$(dirname $(realpath $0))
echo $WORK_PATH

docker build -f $WORK_PATH/DockerfileAuditdV2 -t audisp_build:1.0 .


docker run --rm -v /tmp:/tmp audisp_build:1.0

username=$(whoami)

sudo chown $username:$username $file_path

mv $file_path $WORK_PATH
