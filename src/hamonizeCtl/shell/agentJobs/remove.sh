#!/bin/bash



rm -fr /etc/hamonize
rm -fr /var/log/hamonize    
rm -fr /etc/openvpn/client.conf
service openvpn restart

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
apt-get remove --auto-remove ldap-auth-client -y
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


apt-get remove --auto-remove --purge telegraf -y
rm -fr /etc/telegraf

apt-get remove --purge auditd -y



# exit 



# touch /tmp/remove.log

# rm -fr /etc/hamonize >> /tmp/remove.log
# rm -fr /var/log/hamonize    >> /tmp/remove.log
# rm -fr /etc/openvpn/client.conf >> /tmp/remove.log
# service openvpn restart

# rm -fr /etc/udev/rules.d/30-usb-lockdown.rules  >> /tmp/remove.log

# rm -fr /etc/systemd/system/hamonize-logout.service  >> /tmp/remove.log
# rm -fr /etc/systemd/system/hamonize-login.service   >> /tmp/remove.log
# rm -fr /etc/hamonize/run-script-on-boot.sh  >> /tmp/remove.log
# sudo systemctl disable hamonize-logout.service  >> /tmp/remove.log
# sudo systemctl disable hamonize-login.service   >> /tmp/remove.log
# sudo systemctl disable run-script-on-boot.sh    >> /tmp/remove.log
# sudo systemctl daemon-reload    >> /tmp/remove.log


# apt-get remove --purge hamonize-help -y >> /tmp/remove.log
# apt-get remove --purge hamonize-admin -y    >> /tmp/remove.log
# apt-get remove --purge auditd -y >> /tmp/remove.log
# apt-get remove --purge nscd -y  >> /tmp/remove.log
# apt-get remove --auto-remove ldap-auth-client -y >> /tmp/remove.log
# sudo apt-get remove --auto-remove --purge ldap-auth-config -y >> /tmp/remove.log

# sed -i '/sudoers:.*ldap/d' /etc/nsswitch.conf   >> /tmp/remove.log
# rm -fr /etc/ldap    >> /tmp/remove.log
# rm -fr /etc/ldap.conf   >> /tmp/remove.log
# rm -fr /etc/sudo-ldap.conf  >> /tmp/remove.log
# DEBIAN_FRONTEND=noninteractive pam-auth-update  >> /tmp/remove.log


# # timeshift 목록을 읽어와서 모든 스냅샷 삭제
# for snapshot in $(sudo timeshift --list | grep "init backup" | awk '{print $3}')
# do
#     snapshot_id=$snapshot
#     echo "snapshot_json===$snapshot_id" >> /tmp/remove.log
#     #echo "Deleting snapshot: $snapshot_id"
#     sudo timeshift --delete --snapshot "$snapshot_id"   >> /tmp/remove.log
# done


# apt-get remove --auto-remove --purge telegraf -y >> /tmp/remove.log
# rm -fr /etc/telegraf    >> /tmp/remove.log

# # exit 
