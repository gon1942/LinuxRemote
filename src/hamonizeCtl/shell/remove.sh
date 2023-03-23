#!/bin/bash

rm -fr /etc/hamonize
rm -fr /var/log/hamonize
rm -fr /etc/openvpn/client.conf

rm -fr /etc/udev/rules.d/30-usb-lockdown.rules

rm -fr /etc/systemd/system/hamonize-logout.service
rm -fr /etc/systemd/system/hamonize-login.service
rm -fr /etc/hamonize/run-script-on-boot.sh 
sudo systemctl disable hamonize-logout.service
sudo systemctl disable hamonize-login.service
sudo systemctl disable run-script-on-boot.sh
sudo systemctl daemon-reload


apt-get remove --purge hamonize-help -y
apt-get remove --purge hamonize-admin -y

apt-get remove --purge nscd -y
apt-get remove --auto-remove ldap-auth-client -y # >/dev/null
sudo apt-get remove --auto-remove --purge ldap-auth-config -y 

sed -i '/sudoers:.*ldap/d' /etc/nsswitch.conf
rm -fr /etc/ldap
rm -fr /etc/ldap.conf
rm -fr /etc/sudo-ldap.conf
DEBIAN_FRONTEND=noninteractive pam-auth-update


# timeshift 목록을 읽어와서 모든 스냅샷 삭제
for snapshot in $(sudo timeshift --list | grep "init backup" | awk '{print $3}')
do
    snapshot_id=$snapshot
    echo "snapshot_json===$snapshot_id"
    #echo "Deleting snapshot: $snapshot_id"
    sudo timeshift --delete --snapshot "$snapshot_id"
done


apt-get remove --auto-remove --purge telegraf -y # >/dev/null
rm -fr /etc/telegraf
