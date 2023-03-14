#!/bin/bash


# sudo systemctl stop hamonize-agentmngr.service

dtyp=''
installCmd=''
pkg_check=`for i in $( echo rpm dpkg pacman ); do which $i; done 2> /dev/null`

case $pkg_check in
    *"dpkg"*)
        dtype='dpkg'
        installCmd="apt-get"
    ;;
    *"rpm"*)
        dtype='rpm'
        installCmd="yum"
    ;;
    
esac

if [ $dtype == "dpkg" ];
then
    . debian.sh
else
    . rhel.sh
fi
sleep 1





