#!/bin/bash

. /etc/hamonize/propertiesJob/propertiesInfo.hm

CENTERURL="http://${CENTERURL}/act/progrmAct"
UUID="1c67074bfc1640e2ad9db9f41b5bf7d0"
# UUID=$(cat /etc/hamonize/uuid)
LOGFILE="/var/log/hamonize/agentjob/progrmjobPolicyAct.log"

# 파일이 존재하지 않으면 파일 생성
if [ ! -f $LOGFILE ]; then
        touch $LOGFILE
fi

DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
HOSTNAME=$(hostname)
TENANT=$(cat /etc/hamonize/hamonize_tanent)

# auditd 규칙 파일 경로
RULE_FILE="/etc/audit/rules.d/hamonizeBlock.rules"

# 파일이 존재하지 않으면 파일 생성
if [ ! -f $RULE_FILE ]; then
        touch $RULE_FILE
fi

RULES_ADD=$(cat /etc/hamonize/progrm/progrm.hm | jq '.INS' | sed -e "s/\"//g")
if [ "$RULES_ADD" != null ]; then

        IFS=',' read -ra str_array <<<"$RULES_ADD"
        EC=0
        for str in "${str_array[@]}"; do

                # 차단 프로그램 실행 경로
                APP_PATH=$(which $str)
                echo "차단 프로그램 경로====================>$APP_PATH"

                # check if the auditd rule already exists
                if ! auditctl -l | grep -e "$APP_PATH"; then

                        # 규칙 파일에 htop 실행 로그 추가
                        echo "-a exit,always -F path=$APP_PATH -F perm=x  -k hamonizeBlock" >>$RULE_FILE
                fi

                # echo "-a exit,always -F path=$APP_PATH -F perm=x  -k hamonizeBlock" >>$RULE_FILE
                # echo "-a exit,always -F path=$APP_PATH -F perm=x -F auid>=1000 -F auid!=unset -k hamonizeBlock" >>$RULE_FILE

                # auditd 규칙 파일 로드
                /sbin/auditctl -R $RULE_FILE

                # auditd 서비스 재시작
                systemctl restart auditd

                # INSRET=$INSRET"{\"progrmname\":\"${str}\",\"status\":\"Y\",\"kind\":\"ins\",\"datetime\":\"$DATETIME\",\"hostname\":\"$HOSTNAME\",\"uuid\":\"$UUID\", \"domain\":\"$TENANT\"}"

                # if [ "$EC" -eq "$#" ]; then
                #         INSRET=$INSRET","
                # fi

                # EC=$(expr "$EC" + 1)

                INSRET=$INSRET"{\"progrmname\":\"${str}\",\"status\":\"Y\",\"kind\":\"ins\",\"datetime\":\"$DATETIME\",\"hostname\":\"$HOSTNAME\",\"uuid\":\"$UUID\", \"domain\":\"$TENANT\"}"
                # if [ "$EC" -eq "$#" ]; then
                #         INSRET=$INSRET","
                # fi

                # EC=$(expr "$EC" + 1)


        done
fi

# RULES_DEL=$(cat /etc/hamonize/progrm/progrm.hm | jq '.DEL' | sed -e "s/\"//g")

# if [ "$RULES_DEL" != null ]; then
#         IFS=',' read -ra str_array <<<"$RULES_DEL"
#         # IFS=',' read -ra str_array <<<"htop"

#         EC=0
#         for str in "${str_array[@]}"; do

#                 # # 차단 프로그램 실행 경로
#                 # echo "str====================>$str"
#                 # APP_PATH=$(which $str)
#                 # echo "차단 프로그램 경로====================>$APP_PATH"

#                 # # check if the auditd rule already exists

#                 # chkRules=$(auditctl -l | grep -e "$APP_PATH")
#                 # echo "chkRules====================>$chkRules"
#                 # if [[ -n $chkRules ]]; then
#                 #         echo "Deleting existing audit rule..."
#                 #         sed -i "/${str}/d" "$RULE_FILE"
#                 # fi

#                 # # auditd 규칙 파일 로드
#                 # /sbin/auditctl -R $RULE_FILE

#                 # # auditd 서비스 재시작
#                 # systemctl restart auditd

#                 echo "ec====================>$EC"
#                 echo "str==========####33==========>$#"

#                 if [ "$EC" -eq "$#" ]; then
#                         INSRET=$INSRET","
#                 fi
#                 INSRET=$INSRET"{\"progrmname\":\"${str}\" , \"status\":\"N\", \"kind\":\"del\", \"datetime\":\"$DATETIME\", \"hostname\":\"$HOSTNAME\" , \"uuid\":\"$UUID\" , \"domain\":\"$TENANT\"}"

#                 EC=$(expr "$EC" + 1)

#         done
# fi

sudo rm -fr /etc/hamonize/runprogrmblock >/dev/null 2>&1

echo "################## updt json data ############################"
DELRET=""
RESULT_JSON="{\
       \"insresert\":[$INSRET],\
       \"delresert\": [$DELRET],\
       \"uuid\": \"$UUID\"\
}"

#  JSON DATA

echo $RESULT_JSON #>>$LOGFILE
echo "CENTERURL========$CENTERURL"
curl -X POST -H 'User-Agent: HamoniKR OS' -H 'Content-Type: application/json' -f -s -d "$RESULT_JSON" $CENTERURL
