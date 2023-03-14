#!/bin/bash

echo "debain shell Script"
. /etc/hamonize/propertiesJob/propertiesInfo.hm
echo "=CENTERURL=============+>$CENTERURL"

PCUUID=$(cat /etc/hamonize/uuid)
LOGFILE="/var/log/hamonize/agentjob/updp.log"
TENANT=$(cat /etc/hamonize/hamonize_tanent)
# 파일을 다운로드할 서버 URL
FILESERVERURL="192.168.0.200:5000"
touch $LOGFILE

echo "################### updt deb install ###########################" >>$LOGFILE

UPDT_INS=$(cat /etc/hamonize/updt/updtInfo.hm | jq '.INS' | sed -e "s/\"//g")
SID=$(cat /etc/hamonize/updt/updtInfo.hm | jq '.SID' | sed -e "s/\"//g")

echo "UPDT_INS------------------>$UPDT_INS ,"
echo "SID=========$SID"

if [ "$UPDT_INS" != null ]; then
    echo "install file total  data=========$UPDT_INS" #  >>$LOGFILE

    # 입력받은 문자열을 쉼표(,)를 기준으로 분리하여 배열에 저장
    IFS=',' read -ra str_array <<<"$UPDT_INS"

    # 반복문을 이용하여 파일 다운로드 수행
    for str in "${str_array[@]}"; do
        echo "다운로드 중인 파일: $str"

        # curl 명령어를 이용하여 파일 다운로드
        if curl -s -O "http://${FILESERVERURL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&_sid=${SID}&path=/hamonize/${TENANT}/${str}"; then
            echo "$str 다운로드가 완료되었습니다."
            sudo dpkg -i ${str}

            # dpkg 명령어의 반환 코드를 확인하여 설치가 성공적으로 수행되었는지 확인
            if [[ $? -eq 0 ]]; then
                echo "$str 설치가 완료되었습니다."
                rm ${str}
            else
                echo "$str 설치가 실패했습니다."
            fi
        else
            echo "$str 다운로드가 실패했습니다."
        fi
    done
fi

