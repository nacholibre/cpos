(function() {
    'use strict';

    var express = require('express');
    var io = require('socket.io-client');
    var async = require('async');
    var chai = require('chai');
    var expect = chai.expect;

    var cpos = require('./cpos.js');

    var chromiumServer = new cpos.Server();

    var app = express();

    var options = {
        'force new connection': true
    };

    var socketURL = 'http://localhost:3000';

    app.get('/load_for/:seconds', function (req, res) {
        var seconds = req.params.seconds || 1;

        setTimeout(function() {
            res.send('Hello!');
        }, seconds * 1000);
    });

    app.listen(8080);

    describe('ChromiumPOS', function() {
        this.timeout(10000);

        before(function(done) {
            chromiumServer.listen(3000, 'localhost', done);
        });

        it('should openURL and return data', function(done) {
            var client = io.connect(socketURL, options);
            client.on('connect', function() {
                client.emit('openURL', {url: 'http://localhost:8080/load_for/1'}, function(data) {
                    expect(data.pageLoadTimeMS).to.be.within(1000, 1500);
                    done();
                });
            });
        });

        it('should hit the timeout', function(done) {
            var client = io.connect(socketURL, options);

            client.on('connect', function() {
                client.emit('openURL', {url: 'http://localhost:8080/load_for/2', 'timeout': 1}, function(data) {
                    expect(data.pageLoadTimeMS).to.be.null;
                    expect(data.loaded).to.be.false;
                    done();
                });
            });
        });

        it('should open urls in parallel', function(done) {
            var client = io.connect(socketURL, options);

            client.on('connect', function() {
                var started = new Date();

                async.parallel([
                function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/1'}, function(data) {
                        expect(data.pageLoadTimeMS).to.be.within(1000, 1500);
                        fDone();
                    });
                }, function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/2'}, function(data) {
                        expect(data.pageLoadTimeMS).to.be.within(2000, 2500);
                        fDone();
                    });
                }, function(fDone) {
                    client.emit('openURL', {url: 'http://localhost:8080/load_for/2', timeout: 1}, function(data) {
                        expect(data.loaded).to.be.false;
                        fDone();
                    });
                }], function() {
                    var endedFor = new Date().valueOf() - started.valueOf();
                    expect(endedFor).to.be.within(2000, 3000);
                    done();
                });
            });
        });
    });
})();
