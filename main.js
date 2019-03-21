var fs = require("fs");
var sanitize = require("node-sanitize-options");
var getConfig = function(config) {
  if (fs.existsSync("../node-auto-run.js") === true) config = sanitize.options(config, require("../node-auto-run.js")());
  if (fs.existsSync("./config.js") === true) config = sanitize.options(config, require("./config.js")());
  config = sanitize.options(config, {});
  return config;
}
exports = module.exports = function(config) {
  config = getConfig(config);
  var app = {
    _exec: require('child_process').exec,
    fs: fs,
    sanitize: sanitize,
    wrapper: require("node-promise-wrapper"),
    ps: require("ps-node"),
    config: getConfig,
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
  if (Object.keys(config.projects).length > 0) {
    app.check();
  } else {
    console.log("No project defined.");
  }
  return app;
};
var config = getConfig();
if (config.start === true) new exports();