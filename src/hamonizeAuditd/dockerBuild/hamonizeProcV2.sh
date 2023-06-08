#!/bin/bash


gcc -o hamonizeProcV2 hamonizeProcV2.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify  -ljson-c -lcurl
# -lssl -lcrypto

sleep 1

service auditd stop

rm -fr /usr/local/hamonize-connect/hamonizeProcV2

cp hamonizeProcV2 /usr/local/hamonize-connect/


service auditd start 


exit 0
 


# RUN apt-get update && \
#     apt-get install -y \
#     libnotify-dev \
#     libaudit-dev \
#     libglib2.0-dev
#     libgdk-pixbuf2.0-dev
#     libjson-c-dev
#     libcurl4-openssl-dev

