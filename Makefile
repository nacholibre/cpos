build:
	cd nw-app/; npm install;
	./node_modules/node-webkit-builder/bin/nwbuild\
		-o nw-build\
		-p linux32,linux64\
		nw-app/
