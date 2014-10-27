build:
	npm install node-webkit-builder
	cd nw-app/; npm install;
	./node_modules/node-webkit-builder/bin/nwbuild\
		-o nw-build\
		-p linux32,linux64\
		nw-app/
	#replace udev.so.0 with udev.so.1
	sed -i 's/\x75\x64\x65\x76\x2E\x73\x6F\x2E\x30/\x75\x64\x65\x76\x2E\x73\x6F\x2E\x31/g' ./nw-build/nw-app/linux64/nw-app ./nw-build/nw-app/linux32/nw-app
	./node_modules/node-webkit-builder/bin/nwbuild\
		-o nw-build\
		-p win,osx\
		nw-app/
