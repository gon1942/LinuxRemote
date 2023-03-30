#!/bin/bash


gcc -o hamonizeBlock hamonizeBlock.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl

sleep 1

service auditd stop

rm -fr /sbin/hamonizeBlock

cp hamonizeBlock /sbin/


service auditd start 

service auditd status

exit 0