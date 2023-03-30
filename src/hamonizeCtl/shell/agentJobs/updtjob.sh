#!/bin/bash

# dtyp=''
# installCmd=''
# pkg_check=`for i in $( echo rpm dpkg pacman ); do which $i; done 2> /dev/null`

# case $pkg_check in
#     *"dpkg"*)
#         dtype='dpkg'
#         installCmd="apt-get"
#     ;;
#     *"rpm"*)
#         dtype='rpm'
#         installCmd="yum"
#     ;;

# esac

# echo $dtype
# if [ $dtype == "dpkg" ];
# then
#     # . debian.sh
#     echo "debian os"
# else
#     # . rhel.sh
#     echo "rhel os"
# fi
# sleep 1

WORK_PATH=$(dirname $(realpath $0))
echo $WORK_PATH
if command -v dpkg >/dev/null 2>&1; then # Debian/Ubuntu
    echo "Debian-based system"
    . $WORK_PATH/programInstall
elif command -v rpm >/dev/null 2>&1; then # Red Hat/Fedora/CentOS

    echo "RPM-based system"
else
    echo "Unsupported system"
fi
