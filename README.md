##Introduction
With Chromiumpos you can measure the actual load time users are experiencing for URL (this includes all resources - images, javascript etc and rendering time). You can also take screenshots of the loaded pages. SocketIO is used for server which means the client can be browser for example.

Chromiumpos is written in [node-webkit](https://github.com/rogerwang/node-webkit).

##Usage
To build the app you need [node-webkit](https://github.com/rogerwang/node-webkit) installed in your $PATH, npm and node. You can download prebuild node-webkit for your architecture or install it from your package manager.

npm and node are easy, just install them from your package manager.

After you have all required software to build the package just run `make build` this will build the app for Linux 32/64, OSX and Windows in `./nw-build/nw-app/`.
