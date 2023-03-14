#!/bin/bash


gcc -o audisp-example2 audisp-example2.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl

sleep 1

service auditd stop

rm -fr /sbin/audisp-example2

cp audisp-example2 /sbin/


service auditd start 

service auditd status

exit 0