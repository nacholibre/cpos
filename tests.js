(function() {
    'use strict';

    var express = require('express');
    var io = require('socket.io-client');
    var spawn = require('child_process').spawn;
    var async = require('async');
    var chai = require('chai');
    var expect = chai.expect;

    var app = express();

    var options = {
        'force new connection': true
    };

    var socketURL = 'http://localhost:3000';

    app.get('/load_for/:seconds', function (req, res) {
        var seconds = req.params.seconds || 1;

        setTimeout(function() {
            res.send('Hello!');
        }, seconds*1000);
    });

    app.listen(8080);

    var screenshotServer = spawn('xvfb-run', ['-a', 'nw', 'nw-app']);

    screenshotServer.stdout.on('data', function (data) {
        console.log('nw-app stdout: ' + data);
    });

    screenshotServer.stderr.on('data', function (data) {
        console.log('nw-app stderr: ' + data);
    });

    describe('ChromiumPOS', function() {
        this.timeout(60000);

        it('should request opening and return data', function(done) {
            var client = io.connect(socketURL, options);
            client.on('connect', function() {
                client.emit('openURL', {url: 'http://localhost:8080/load_for/1'}, function(data) {
                    expect(data.pageLoadTimeMS).to.be.above(1000);
                    expect(data.pageLoadTimeMS).not.to.be.above(1200);
                    done();
                });
            });
        });

        it('should request slow opening and return timeouted', function(done) {
            var client = io.connect(socketURL, options);

            client.on('connect', function() {
                client.emit('openURL', {url: 'http://localhost:8080/load_for/2', 'timeout': 1}, function(data) {
                    expect(data.pageLoadTimeMS).to.be.null;
                    expect(data.loaded).to.be.false;
                    done();
                });
            });
        });

        it('should open pages in parallel', function(done) {
            var client = io.connect(socketURL, options);

            client.on('connect', function() {
                var started = new Date();

                async.parallel([
                function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/1'}, function(data) {
                        expect(data.pageLoadTimeMS).to.be.within(1000, 1200);
                        fDone();
                    });
                }, function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/2'}, function(data) {
                        expect(data.pageLoadTimeMS).to.be.within(2000, 2200);
                        fDone();
                    });
                }, function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/2', timeout: 1}, function(data) {
                        expect(data.loaded).to.be.false;
                        fDone();
                    });
                }], function() {
                    var endedFor = new Date().valueOf() - started.valueOf();
                    expect(endedFor).to.be.within(2000, 2400);
                    done();
                });
            });
        });
    });
})();
