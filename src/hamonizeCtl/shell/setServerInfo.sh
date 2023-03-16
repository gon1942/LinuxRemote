#!bin/bash

DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
LOGFILE="/var/log/hamonize/propertiesJob/propertiesJob.log"
FILEPATH="/etc/hamonize/propertiesJob/propertiesInfo.hm"
FILEPATH_TMP="/etc/hamonize/propertiesJob/chkpropertiesInfo.hm"

HWFILE="/etc/hamonize/hwinfo/hwinfo.hm"

cat /dev/null >$LOGFILE

# Step 1.  Create Directory & File------------------------------------------------------------------------#
directories=(
        # Config
        "/etc/hamonize/"
        "/etc/hamonize/hwinfo"
        "/etc/hamonize/propertiesJob"
        "/etc/hamonize/backup"
        "/etc/hamonize/hwinfo"
        "/etc/hamonize/progrm"
        "/etc/hamonize/siteblock"
        "/etc/hamonize/backup"
        "/etc/hamonize/updt"
        "/etc/hamonize/security"
        "/etc/hamonize/firewall"
        "/etc/hamonize/recovery"
        # Log
        "/var/log/hamonize"     
        "/var/log/hamonize/pc_hw_chk"
        "/var/log/hamonize/propertiesJob"
        "/var/log/hamonize/agentjob"
        "/var/log/hamonize/adcon"
)

files=(
        "/etc/hamonize/uuid"
        "/etc/hamonize/propertiesJob/propertiesInfo.hm"
        "/etc/hamonize/propertiesJob/chkpropertiesInfo.hm"
        "/etc/hamonize/backup/backupInfo.hm"
        "/var/log/hamonize/pc_hw_chk/pc_hw_chk.log"
        "/var/log/hamonize/propertiesJob/propertiesJob.log"
        "/var/log/hamonize/propertiesJob/hamonize-connector_error.log"
        "/var/log/hamonize/agentjob/updp.log"
        "/var/log/hamonize/adcon/sgm.log"
        "/var/log/hamonize/adcon/output.log"
        "/var/log/hamonize/adcon/curlinstall.log"
        "/var/log/hamonize/adcon/backuplog.log"
)

# Create directories
for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
                mkdir -p "$dir"
        fi
done

# Create files
for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
                touch "$file"
        fi
done

# Step 2. UUID 생성 ----------------------------------------------------------------------------------------#
UUID=$(cat /etc/hamonize/uuid)
cat /dev/null >/etc/hamonize/uuid
cat /etc/machine-id | sudo tee -a /etc/hamonize/uuid

sleep 1

apt-get update

sleep 1

# Step 3. Hamonize Server Info Set -------------------------------------------------------------------------#
#  JQ install check
REQUIRED_PKG="jq"
PKG_OK=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG | grep "install ok installed")
echo Checking for $REQUIRED_PKG: $PKG_OK
if [ "" = "$PKG_OK" ]; then
        echo "$DATETIME ]-------->No $REQUIRED_PKG. Setting up $REQUIRED_PKG." >>$LOGFILE
        sudo apt-get --yes install $REQUIRED_PKG >>$LOGFILE
fi
sleep 1

echo "$DATETIME ]-------->jq install status \n $(dpkg -l jq)" >>$LOGFILE

CENTERURL="$1/hmsvc/commInfoData"

DATA_JSON="{\
        \"events\" : [ {\ 
        \"uuid\": \"$UUID\"\
        } ]\
}"
echo $CENTERURL >>$LOGFILE
echo $DATA_JSON >>$LOGFILE

sleep 2

RETDATA=$(curl -X GET -H 'User-Agent: HamoniKR OS' -H 'Content-Type: application/json' -f -s -d "$DATA_JSON" $CENTERURL)
echo "하모나이즈 서버 정보 요청 값: $RETDATA" >>$LOGFILE

WRITE_DATA=""
FILEPATH_DATA=$(cat ${FILEPATH})
FILEPATH_BOOL=false
if [ -z "$FILEPATH_DATA" ]; then
        FILEPATH_BOOL=true
fi

JQINS=$(echo ${RETDATA} | jq '.pcdata')
JQCNT=$(echo ${RETDATA} | jq '.pcdata' | jq length)
SET=$(seq 0 $(expr $JQCNT - 1))
for i in $SET; do
        TMP_ORGNM=$(echo ${RETDATA} | jq '.pcdata | .['$i'].svrname' | sed -e "s/\"//g")
        TMP_PCIP=$(echo ${RETDATA} | jq '.pcdata | .['$i'].pcip' | sed -e "s/\"//g")
        WRITE_DATA="$TMP_ORGNM=$TMP_PCIP"
        if [ $FILEPATH_BOOL = "true" ]; then
                echo $WRITE_DATA >>$FILEPATH
        else
                echo $WRITE_DATA >>$FILEPATH_TMP
        fi
done

if [ $FILEPATH_BOOL = "false" ]; then
        DIFF_VAL=$(diff -q $FILEPATH $FILEPATH_TMP)
        if [ -z "$DIFF_VAL" ]; then
                rm -fr $FILEPATH_TMP
        else
                rm -fr $FILEPATH
                mv $FILEPATH_TMP $FILEPATH
        fi
fi

echo "$DATETIME ]-------->agent에서 사용하는 rest 서버 정보 저장 [END] " >>$LOGFILE

CENTERURL=$(cat $FILEPATH | grep CENTERURL | awk -F '=' '{print $2}')

echo $CENTERURL

