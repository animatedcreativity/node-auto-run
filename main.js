exports = module.exports = function(config) {
  var fileConfig = require("node-file-config")("node-auto-run");
  config = fileConfig.get(config);
  /* just for not allowing another copy of node-auto-run */
  var expressApp = require("express");
  var express = new expressApp();
  express.listen(config.expressPort, function() {
    console.log("Your app is listening on port: " + config.expressPort);
  });
  var app = {
    _exec: require('child_process').exec,
    wrapper: require("node-promise-wrapper"),
    ps: require("ps-node"),
    config: fileConfig.get,
    exec: function(project) {
      return new Promise(async function(resolve, reject) {
        app._exec("nohup npm start --prefix " + project + " " + project + " 2>/dev/null 1>/dev/null & ", function(error, stdout, stderr) {
          if (typeof error === "undefined") {
            resolve(stdout);
          } else {
            reject(error, stderr);
          }
        });
      });
    },
    processes: function() {
      return new Promise(function(resolve, reject) {
        app.ps.lookup({command: "node", arguments: ""}, function(error, list) {
          if (typeof list !== "undefined") {
            resolve(list);
          } else {
            reject(error);
          }
        });
      });
    },
    process: function(argument) {
      return new Promise(async function(resolve, reject) {
        var {error, list} = await app.wrapper("list", app.processes());
        if (typeof list !== "undefined") {
          var found;
          for (var i=0; i<=list.length-1; i++) {
            var item = list[i];
            for (var a=0; a<=item.arguments.length-1; a++) {
              var arg = item.arguments[a];
              if (arg.toLowerCase() === argument.toLowerCase()) {
                found = item;
              }
            }
          }
          if (typeof found !== "undefined") {
            resolve(found);
          } else {
            reject({status: 404, error: "Not found."});
          }
        } else {
          reject(error);
        }
      });
    },
    checks: {},
    check: async function() {
      var newConfig = app.config();
      if (JSON.stringify(config) !== JSON.stringify(newConfig)) {
        config = newConfig;
      }
      for (var project in config.projects) {
        var {error, process} = await app.wrapper("process", app.process(project));
        if (typeof process === "undefined") {
          if (typeof app.checks[project] === "undefined") app.checks[project] = 0;
          app.checks[project] += 1;
          if (app.checks[project] >= config.checks) {
            var {error, result} = await app.wrapper("result", app.exec(project));
            console.log("Started project: " + project);
            app.checks[project] = 0;
          }
        }
      }
      setTimeout(function() {
        app.check();
      }, config.interval);
    },
  };
  app.check();
  console.log("No project defined. Will keep looking for changes in config files.");
  return app;
};
var fileConfig = require("node-file-config");
var config = new fileConfig("node-auto-run");
if (config.get().start === true) new exports();