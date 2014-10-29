'use strict';

var cpos = require('../cpos.js');
var io = require('socket.io-client');

var chromiumServer = new cpos.Server();

chromiumServer.listen(3000, 'localhost', function() {
    console.log('Chromium browser socketIO server has started');

    var client = io.connect('http://localhost:3000');
    client.on('connect', function() {

        client.emit('openURL', {'url': 'http://google.com'}, function(data) {
            console.log('Google takes %s milliseconds to load', data.pageLoadTimeMS);

            client.close();
            chromiumServer.close();
        });
    });
});
