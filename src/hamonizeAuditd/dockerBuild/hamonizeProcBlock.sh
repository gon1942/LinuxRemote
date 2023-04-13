#!/bin/bash


gcc -o hamonizeProcBlock hamonizeProcBlock.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl

sleep 1

service auditd stop

rm -fr /sbin/hamonizePrhamonizeProcBlockocV3

cp hamonizeProcBlock /sbin/


service auditd start 


exit 0 