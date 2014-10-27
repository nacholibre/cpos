##Introduction
With Chromiumpos you can measure the actual load time users are experiencing for URL (this includes all resources - images, javascript etc and rendering time). You can also take screenshots of the loaded pages. SocketIO is used for server which means the client can be browser for example.

Chromiumpos is written in [node-webkit](https://github.com/rogerwang/node-webkit).

##Usage
####Building the app
To build the app you need [node-webkit](https://github.com/rogerwang/node-webkit) installed in your $PATH, npm and node. You can download prebuild node-webkit for your architecture or install it from your package manager.

npm and node are easy, just install them from your package manager.

After you have all required software to build the package just run `make build` this will build the app for Linux 32/64, OSX and Windows in `./nw-build/nw-app/`.

####Running the app
After the app is compiled run `./nw-build/nw-app/linux64/nw-app -h 127.0.0.1 -p 3000`. This will run the application and the socketIO server on 127.0.0.0:3000.

nw-app requires visual environment to run, if you run it on linux server you can use xvfb (X Virtual Frame Buffer). 

Example:
```xvfb-run -a ./nw-build/nw-app/linux64/nw-app -h 127.0.0.1 -p 3000```

Here is simple client example written in node
```javascript
'use strict';

var socket = require('socket.io-client')('http://localhost:3000');

socket.on('connect', function() {
    socket.emit('openURL', {url: 'http://ebay.co.uk'}, function(data) {
        console.log(data);
    });
});
```
returns
```{ pageLoadTimeMS: 1998, screenshot: null, loaded: true }```

##API
###socket.emit('openUrl', options, callback);
available `options` are 
- url: url for opening
- width: window width (default: 1280)
- height: window height (default: 768)
- capture: return screenshot as base64 encoded string (default: false)
- timeout: max timeout in seconds when opening url (default: 15 seconds)

callback is called with
- pageLoadTimeMS: page load time in milliseconds
- screenshot: base64 encoded screenshot of the loaded page (only if capture is set to true)
- loaded: True or False, false can be if the timeout is reached

`openUrl` opens new tab in Chromium and after page has loaded the tab is closed and the callback is executed, which means you can open pages in parallel.

You can use [node async](https://github.com/caolan/async) to limit max parallel tasks.
