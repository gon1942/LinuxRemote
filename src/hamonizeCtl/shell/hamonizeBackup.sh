#!/bin/bash

DEVICE=$(df -T / | grep 'ext*' | awk '{print $1}')
Log_backup="/var/log/hamonize/adcon/backuplog.log"
INFOHM="/etc/hamonize/propertiesJob/propertiesInfo.hm"
CENTERURL=$(cat $INFOHM | grep CENTERURL | awk -F '=' '{print $2}')
DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
UUID=$(cat /etc/machine-id)
HOSTNAME=$(hostname)
TENANT=$(cat /etc/hamonize/hamonize_tanent)

cat /dev/null > $Log_backup

echo "DEVICE === > $DEVICE"

FILEPATH=""
if [ -f "/etc/timeshift/timeshift.json" ]; then
    mv /etc/timeshift/timeshift.json /etc/timeshift/timeshift.json_back
elif [ -f "/etc/timeshift.json" ]; then
    mv /etc/timeshift.json /etc/timeshift.json_back
else
    echo "file not exist"
fi

TIMESHIFT_UUID=$(timeshift --list | grep UUID | awk -F ':' '{print $2}' | sed 's/ //g')
echo $TIMESHIFT_UUID >> $Log_backup

if [ -f "/etc/timeshift/timeshift.json" ]; then
    FILEPATH="/etc/timeshift/timeshift.json"
elif [ -f "/etc/timeshift.json" ]; then
    FILEPATH="/etc/timeshift.json"
fi

if [ ! -f "$FILEPATH" ]; then
    timeshift -V >/dev/null
    if [ -f "/etc/timeshift/timeshift.json" ]; then
        FILEPATH="/etc/timeshift/timeshift.json"
    elif [ -f "/etc/timeshift.json" ]; then
        FILEPATH="/etc/timeshift.json"
    fi
fi

echo $FILEPATH >> $Log_backup

sed -i "s/backup_device_uuid\" \: \"\"/backup_device_uuid\" \: \"${TIMESHIFT_UUID}\"/g" $FILEPATH

sed -i "s/\"true\"/\"false\"/g" $FILEPATH
sed -i "s/do_first_run\" \: \"true\"/do_first_run\" \: \"first\"/g" $FILEPATH

USERID=$1

sed -i "s/exclude\" \: \[/exclude\" \: \[\n \"+ \/home\/$USERID\/**\" /g" $FILEPATH

(

    sudo timeshift --snapshot-device "$DEVICE" --scripted --create --comments "init backup" >> $Log_backup

    BKNAME=$(cat $Log_backup | grep 'Tagged*' | awk '{print $3}' | awk -F "'" '{print $2}')
    BKDIR="/timeshift/snapshots"

    if curl --output /dev/null --silent --head --fail "$CENTERURL"; then
        echo "HTTP 연결 성공"
        BKCENTERURL="http://$CENTERURL/backup/setBackupJob"
    else
        echo "HTTP 연결 실패. HTTPS로 시도합니다."
        BKCENTERURL="https://$CENTERURL/backup/setBackupJob"
    fi

    BK_JSON="{\
                \"events\" : [ {\
                \"datetime\":\"$DATETIME\",\
                \"uuid\":\"$UUID\",\
                \"name\": \"$BKNAME\",\
                \"hostname\": \"$HOSTNAME\",\
                \"gubun\": \"A\",\
                \"domain\": \"$TENANT\",\
                \"dir\": \"$BKDIR\"\
                } ]\
        }"

    echo "BK_JSON BKCENTERURL ====$BKCENTERURL" >> $Log_backup
    RETBAK=$(curl -X POST -H 'User-Agent: HamoniKR OS' -H 'Content-Type: application/json' -f -s -d "$BK_JSON" $BKCENTERURL)
    echo $RETBAK >> $Log_backup

) &

{
    i="0"
    while true; do
        proc=$(ps aux | grep -e "timeshift*" | head -1 | awk '{print $NF}')
        if [ "$proc" = "timeshift*" ]; then break; fi
        sleep 2
        backupProcessVal=$(cat -v /var/log/hamonize/adcon/backuplog.log | tr '^M' '@@' | grep -w 'complete' | awk -F '@@' '{c+=NF-1}END{print $c}' | sed 's/(??? remaining)//g')
        if [ -z "$backupProcessVal" ]; then
            echo "$backupProcessVal is empty" >/dev/null
        else
            echo "백업 진행률: $backupProcessVal%" >> /tmp/backup.log
        fi
        i=$(expr $i + 1)
    done
    echo '100% complete' >> /tmp/backup.log
    sleep 2
}


# echo "backup End Timeshift Config File restore==== " >> $Log_backup
# if [ -f "/etc/timeshift/timeshift.json" ]; then
#     rm -fr /etc/timeshift/timeshift.json
#     mv /etc/timeshift/timeshift.json_back  /etc/timeshift/timeshift.json
# elif [ -f "/etc/timeshift.json" ]; then
#     rm -fr /etc/timeshift.json
#     mv /etc/timeshift.json_back  /etc/timeshift.json
# fi
