// Generated by CoffeeScript 1.3.3
(function() {
  var assert, async, createStatMap, crypto, fs, glob, globHashses, haveFilesChanged, noCallCount, noErr, touch, yesCallCount;

  fs = require('fs');

  crypto = require('crypto');

  glob = require('glob');

  async = require('async');

  globHashses = {};

  module.exports = haveFilesChanged = function(filesGlob, _arg) {
    var changeCallback, errorCallback, noChangeCallback;
    changeCallback = _arg.yes, noChangeCallback = _arg.no, errorCallback = _arg.error;
    return glob(filesGlob, function(err, files) {
      if (err != null) {
        return errorCallback(err);
      }
      return async.map(files, createStatMap, function(err, filenamesWithMtimes) {
        var hash;
        if (err != null) {
          return errorCallback(err);
        }
        filenamesWithMtimes = filenamesWithMtimes.sort().join('\n');
        hash = crypto.createHash('sha1').update(filenamesWithMtimes).digest('hex');
        if (hash === globHashses[filesGlob]) {
          return noChangeCallback();
        } else {
          globHashses[filesGlob] = hash;
          return changeCallback();
        }
      });
    });
  };

  createStatMap = function(file, cb) {
    return fs.stat(file, function(err, stats) {
      if (err != null) {
        return cb(err);
      }
      return cb(noErr, "" + file + " " + (stats.mtime.getTime()));
    });
  };

  noErr = null;

  if (process.argv[1] === __filename) {
    assert = require('assert');
    touch = function(filename) {
      return fs.writeFileSync(filename, Date.now());
    };
    touch('/tmp/foo.txt');
    touch('/tmp/bar.txt');
    touch('/tmp/baz.jpg');
    yesCallCount = 0;
    noCallCount = 0;
    async.series([
      function(cb) {
        return haveFilesChanged('/tmp/*.txt', {
          yes: function() {
            yesCallCount++;
            return cb();
          },
          no: function() {
            noCallCount++;
            return cb();
          }
        });
      }, function(cb) {
        assert(yesCallCount === 1 && noCallCount === 0);
        return haveFilesChanged('/tmp/*.txt', {
          yes: function() {
            yesCallCount++;
            return cb();
          },
          no: function() {
            noCallCount++;
            return cb();
          }
        });
      }, function(cb) {
        assert(yesCallCount === 1 && noCallCount === 1);
        return setTimeout(function() {
          touch('/tmp/foo.txt');
          return haveFilesChanged('/tmp/*.txt', {
            yes: function() {
              yesCallCount++;
              return cb();
            },
            no: function() {
              noCallCount++;
              return cb();
            }
          });
        }, 1000);
      }, function(cb) {
        assert(yesCallCount === 2 && noCallCount === 1);
        touch('/tmp/baz.jpg');
        return haveFilesChanged('/tmp/*.txt', {
          yes: function() {
            yesCallCount++;
            return cb();
          },
          no: function() {
            noCallCount++;
            return cb();
          }
        });
      }, function(cb) {
        assert(yesCallCount === 2 && noCallCount === 2);
        return console.log('ok');
      }
    ]);
  }

}).call(this);