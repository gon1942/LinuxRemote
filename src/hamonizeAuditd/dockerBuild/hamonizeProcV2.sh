#!/bin/bash


gcc -o hamonizeProcV2 hamonizeProcV2.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl

sleep 1

service auditd stop

rm -fr /usr/local/hamonize-connect/hamonizeProcV2

cp hamonizeProcV2 /usr/local/hamonize-connect/


service auditd start 


exit 0