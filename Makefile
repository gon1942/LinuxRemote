all: build_node_app

build_node_app:
	@echo "Update node binary..." 
	
	
	cd src/hamonizeGui/ && \
	npm run clean && \
	npm install && \
	npm run build:linux && \
	cp -v ./dist/hamonize-connect-1.0.0.AppImage ../../usr/local/hamonize-connect/hamonize-connect	&& \
	cd ../../src/hamonizeCtl/ && \
	npm run clean && \
	npm install && \
	npm run build && \
	cp -v ./dist/hamonizeCtl ../../usr/local/hamonize-connect/hamonizeCtl && \
	cp -v ./dist/hamonizeCtl ../../bin && \
    cd ../../src/hamonizeAuditd && \
	gcc -o hamonizePolicy hamonizePolicy.c `pkg-config --cflags glib-2.0` `pkg-config --cflags gdk-pixbuf-2.0` `pkg-config --libs glib-2.0` `pkg-config --libs gdk-pixbuf-2.0` -lauparse -laudit -lnotify -lssl -lcrypto -ljson-c -lcurl  && \
	cp -v ./hamonizePolicy ../../usr/local/hamonize-connect/hamonizePolicy 


clean:
	rm -fv usr/share/hamonize-connect
