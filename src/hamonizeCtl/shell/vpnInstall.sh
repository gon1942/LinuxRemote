#!/bin/bash

. /etc/hamonize/propertiesJob/propertiesInfo.hm
Log_output="/var/log/hamonize/propertiesJob/propertiesJob.log"

# WORK_PATH=$(dirname $(realpath $0))

vpnwork() {

	DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
	# MACHIDTMP=$(cat /etc/hamonize/uuid )
	MACHIDTMP=$(cat /etc/machine-id)
	# MACHIDTMP=$(cat /etc/hamonize/uuid | head -1)
	echo $MACHIDTMP  >> $Log_output
	CLIENT="hm-$MACHIDTMP"
	
	INFOHM="/etc/hamonize/propertiesJob/propertiesInfo.hm"
	VPNIP=$(cat $INFOHM | grep VPNIP | awk -F '=' '{print $2}')

	VPNSCRIPTPATH="/etc/hamonize"
	VPNSCRIPT=$VPNSCRIPTPATH"/vpn-auto-connection.sh"

	DATETIME=$(date +'%Y-%m-%d %H:%M:%S')
	UUID=$(cat /etc/machine-id)
	CPUID=$(dmidecode -t 4 | grep ID)
	CPUINFO=$(cat /proc/cpuinfo | grep "model name" | head -1 | cut -d" " -f3- | sed "s/^ *//g")
	IPADDR=$(ifconfig | awk '/inet .*broadcast/' | awk '{print $2}')
	MACADDR=$(ifconfig | awk '/ether/' | awk '{print $2}')
	HOSTNAME=$(hostname)
	MEMORY=$(awk '{ printf "%.2f", $2/1024/1024 ; exit}' /proc/meminfo)
	HDDTMP=$(fdisk -l | head -1 | awk '{print $2}' | awk -F':' '{print $1}')
	HDDID=$(hdparm -I $HDDTMP | grep 'Serial\ Number' | awk -F ':' '{print $2}')
	HDDINFO=$(hdparm -I $HDDTMP | grep 'Model\ Number' | awk -F ':' '{print $2}')

	echo "$CLIENT========" >> $Log_output
	echo "$VPNIP========" >> $Log_output

	# vpn key 생성
	VPN_KEY_CREATE=$(curl http://$VPNIP/getClients/hmon_vpn_vpn/$CLIENT)
	RET_VPNKEY=$VPN_KEY_CREATE | grep -o "SUCCESS" | wc -l
	echo "RET_VPNKEY======$RET_VPNKEY" >> $Log_output

	wget_key=$(wget -O "/etc/hamonize/ovpnclient/$CLIENT.ovpn" --server-response -c "http://$VPNIP/getClientsDownload/$CLIENT" 2>&1)
	echo "wget_key======$wget_key" >> $Log_output
	exit_status=$?
	sleep 10
	wget_status=$(awk '/HTTP\//{ print $2 }' <<<$wget_key | tail -n 1)

	if test "$wget_status" != "200"; then
		echo "ERROR-1994 --- $wget_status" >>$Log_output
		exit 1
	else

		sudo cp /etc/hamonize/ovpnclient/*.ovpn /etc/openvpn/client.conf

		ls /etc/openvpn/ >>$Log_output

		sudo systemctl enable openvpn@client.service
		sudo systemctl daemon-reload
		sudo systemctl restart openvpn@client.service

		# sleep 5

		# VPNIPADDR=$(ifconfig | awk '/inet .*destination/' | awk '{print $2}' | grep 20 | wc -l)
		# echo "========++" >>$Log_output
		# echo "$DATETIME]  vpn ip addr is =-------------------------=$VPNIPADDR" >>$Log_output

		# if [ "$VPNIPADDR" == "0" ]; then
		# 	vpn="FAIL"
		# else
		# vpn="SUCCESS"
		# fi
		# echo $vpn >>$Log_output

		# echo $vpn
		echo >&1 "Y"
		# exit 0
	fi

}

vpn_create() {
	for i in openvpn network-manager-openvpn; do
		RE_PKG_CHK=$(dpkg-query -W --showformat='${Status}\n' $i | grep "install ok")

		if [ "" = "$RE_PKG_CHK" ]; then
			sudo apt-get install -y $i

		fi
	done

	sleep 1

	vpnwork
	# vpnclientchk=$(ls /etc/hamonize/ovpnclient/ | grep -c hm-*) >> $Log_output
	# # echo "---$vpnclientchk" >>$Log_output

	# if [ "$vpnclientchk" -eq 1 ]; then
	#     	echo "file exit" >>$Log_output

	# 	vpnkeynm=`ls /etc/hamonize/ovpnclient | grep hm-* | awk -F'.' '{print $1}'`
	# 	nmcli con down $vpnkeynm >>$Log_output
	#     nmcli con delete $vpnkeynm >> $Log_output
	# 	vpnwork

	# else
	#     echo "file not exitst" >>$Log_output
	# 	vpnwork
	# fi

}

vpn_create
