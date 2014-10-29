(function() {
    'use strict';

    var spawn = require('child_process').spawn;
    var psTree = require('ps-tree');

    function Server() {
        this.screenshotServer = null;
        this.pids = [];
    }

    Server.prototype.end = function() {
        if (this.screenshotServer) {
            this.pids.forEach(function(pid) {
                process.kill(pid);
            });
        }
    };

    Server.prototype._getChildrenPids = function(parentPID, callback) {
        var pids = [];
        psTree(parentPID, function(err, children) {
            children.forEach(function(child) {
                if (pids.indexOf(child.PPID) === -1) {
                    pids.push(child.PPID);
                    pids.push(child.PID);
                }
            });
            callback(pids);
        });
    };

    Server.prototype.listen = function(port, host, callback) {
        var self = this;

        this.screenshotServer = spawn('xvfb-run',
                                     ['-a',
                                     './node_modules/nodewebkit/nodewebkit/nw',
                                     'nw-app',
                                     '-p ' + port,
                                     '-h ' + host]);


        this.screenshotServer.stdout.on('data', function (data) {
            if (data.toString().indexOf('APPINIT') !== -1) {
                //APPINIT is actually a console.log('APPINIT') from the
                //node webkit application. We found it in stdout meaning
                //the application has started and its ready
                if (typeof callback === 'function') {
                    self._getChildrenPids(self.screenshotServer.pid, function(pids) {
                        self.pids = pids;
                    });
                    callback();
                }
            }
        });

        process.once('exit', function() {
            self.end();
        });

        process.once('uncaughtException', function() {
            self.end();
        });
    };

    module.exports = {
        'Server': Server
    };
})();
