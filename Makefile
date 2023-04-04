all: build_node_app

build_node_app:
	@echo "Update node binary..." 
	
	
	cd src/hamonizeAuditd/dockerBuild/ && \
	/bin/bash buildV2.sh && \
	cp  hamonizeProcV2 ../../../usr/local/hamonize-connect/	&& \
	/bin/bash buildV3.sh && \
	cp  hamonizeProcV3 ../../../usr/local/hamonize-connect/ && \
	cd ../../../src/hamonizeGui/ && \
	npm run clean && \
	npm install && \
	npm run build:linux && \
	cp -v ./dist/hamonize-connect-1.0.0.AppImage ../../usr/local/hamonize-connect/hamonize-connect	&& \
	cd ../../src/hamonizeCtl/ && \
	npm run clean && \
	npm install && \
	npm run build && \
	cp -v ./dist/hamonizeCtl ../../usr/local/hamonize-connect/hamonizeCtl && \
	cp -v ./dist/hamonizeCtl ../../bin 
    
	


clean:
	rm -fv usr/share/hamonize-connect
