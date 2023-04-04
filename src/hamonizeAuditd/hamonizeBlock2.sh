#!/bin/bash


gcc -o hamonizeBlock2 hamonizeBlock2.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto  -lcurl

sleep 1

service auditd stop

rm -fr /sbin/hamonizeBlock2

cp hamonizeBlock2 /sbin/


service auditd start 

# service auditd status

exit 0