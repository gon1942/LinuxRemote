#!/bin/bash

sleep 10

DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
LOGFILE="/var/log/hamonize/propertiesJob/hamonizeReboot.log"
FILEPATH="/etc/hamonize/propertiesJob/propertiesInfo.hm"
FILEPATH_TMP="/etc/hamonize/propertiesJob/chkpropertiesInfo.hm"

if [ ! -d $LOGFILE ]; then
        touch $LOGFILE
fi

cat /dev/null >$LOGFILE

echo "$DATETIME] resboot==========START" >>$LOGFILE

UUID=$(cat /etc/hamonize/uuid)

# 초기 필수 정보......
CENTERURL="http://61.32.208.27:8083/hmsvc/commInfoData"
# CENTERURL="$1/hmsvc/commInfoData"

DATA_JSON="{\
        \"events\" : [ {\
        \"uuid\": \"$UUID\"\
        } ]\
}"

sleep 3
echo "set pc info url===$CENTERURL" >>$LOGFILE
echo "set pc info data $DATA_JSON" >>$LOGFILE

RETDATA=$(curl -X GET -H 'User-Agent: HamoniKR OS' -H 'Content-Type: application/json' -f -s -d "$DATA_JSON" $CENTERURL)

echo "$DATETIME ]--------> get data ::: " >>$LOGFILE
echo "$RETDATA" >>$LOGFILE

setHamonizeServer() {
        WRITE_DATA=""
        FILEPATH_DATA=$(cat ${FILEPATH})
        echo $FILEPATH
        FILEPATH_BOOL=false

        if [ -z "$FILEPATH" ]; then
                echo "no file"
                touch $FILEPATH
                FILEPATH_BOOL=true
        fi

        if [ -z "$FILEPATH_TMP" ]; then
                touch $FILEPATH_TMP
        else
                cat /dev/null >$FILEPATH_TMP
        fi

        JQINS=$(echo ${RETDATA} | jq '.pcdata')
        JQCNT=$(echo ${RETDATA} | jq '.pcdata' | jq length)

        SET=$(seq 0 $(expr $JQCNT - 1))

        for i in $SET; do

                TMP_ORGNM=$(echo ${RETDATA} | jq '.pcdata | .['$i'].svrname' | sed -e "s/\"//g")
                TMP_PCIP=$(echo ${RETDATA} | jq '.pcdata | .['$i'].pcip' | sed -e "s/\"//g")

                WRITE_DATA="$TMP_ORGNM=$TMP_PCIP"
                echo $WRITE_DATA >>$FILEPATH_TMP

        done

        #        if [ $FILEPATH_BOOL = "false" ]; then
        DIFF_VAL=$(diff -q $FILEPATH $FILEPATH_TMP)

        if [ -z "$DIFF_VAL" ]; then
                rm -fr $FILEPATH_TMP
        else
                rm -fr $FILEPATH
                mv $FILEPATH_TMP $FILEPATH
        fi
        #        fi

        echo "$DATETIME ]-------->agent에서 사용하는 rest 서버 정보 저장 [END] " >>$LOGFILE
}

if [ "" == "$RETDATA" ]; then
        sleep 10
        setHamonizeServer
else
        setHamonizeServer
fi

echo "$DATETIME] hamonize-user && admin 필수 포트 allow ==========END" >>$LOGFILE

# UFW에 허용할 포트 리스트
ports=(11100 11400 22 2202 1234)

# UFW에서 포트 허용이 되어있는지 확인
for port in "${ports[@]}"; do
        ufw allow "$port"
done

echo "$DATETIME] resboot==========END" >>$LOGFILE
exit 0
