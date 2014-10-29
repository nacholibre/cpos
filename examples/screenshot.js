'use strict';

var cpos = require('../cpos.js');
var io = require('socket.io-client');
var fs = require('fs');

var chromiumServer = new cpos.Server();

chromiumServer.listen(3000, 'localhost', function() {
    console.log('Chromium browser socketIO server has started');

    var client = io.connect('http://localhost:3000');
    client.on('connect', function() {
        var options = {
            url: 'http://google.com',
            capture: true,
            width: 1280,
            height: 768,
        };

        client.emit('openURL', options, function(data) {
            console.log('Google takes %s milliseconds to load', data.pageLoadTimeMS);

            var regex = /^data:image\/(png|jpg|jpeg);base64,/;
            var base64Data = data.screenshot.replace(regex, "");

            fs.writeFile('./screenshot.png', base64Data, 'base64', function() {
                console.log('Screenshot of google.com was saved');

                client.close();
                chromiumServer.close();
            });
        });
    });
});
