#!/bin/bash

. /etc/hamonize/propertiesJob/propertiesInfo.hm

DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
UUID=$(cat /etc/machine-id)
LOGFILE="/var/log/hamonize/agentjob/loginout.log"
DOMAIN=$(cat /etc/hamonize/hamonize_tanent)
sudo touch $LOGFILE

GUBUN=""
# CENTERURL="https://${CENTERURL}/act/loginout"

case $1 in
login)
        GUBUN="LOGIN"
        ;;

logout)
        GUBUN="LOGOUT"
        ;;
esac

LOGININFO_JSON="{\
       \"events\" : [ {\
       \"datetime\":\"$DATETIME\",\
       \"uuid\":\"$UUID\",\
       \"domain\": \"$DOMAIN\",\
       \"gubun\": \"$GUBUN\"\
       } ]\
}"

echo $LOGININFO_JSON >>$LOGFILE


if curl --output /dev/null --silent --head --fail "$CENTERURL"; then
        # HTTP 요청이 성공하면 HTTP로 curl 명령어를 실행합니다.
        echo "HTTP 연결 성공"
        # BKCENTERURL="http://$CENTERURL/backup/setBackupJob"
        CENTERURL="http://${CENTERURL}/act/loginout"

else
        # HTTP 요청이 실패하면 HTTPS로 curl 명령어를 실행합니다.
        echo "HTTP 연결 실패. HTTPS로 시도합니다."
        # BKCENTERURL="https://$CENTERURL/backup/setBackupJob"
        CENTERURL="https://${CENTERURL}/act/loginout"
fi

RET=$(curl -X POST -H 'User-Agent: HamoniKR OS' -H 'Content-Type: application/json' -f -s -d "$LOGININFO_JSON" $CENTERURL)

echo $RET >>$LOGFILE
