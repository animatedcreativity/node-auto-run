# node-auto-run

Starts node projects automatically and keeps checking for them. Starts the projects again if they get crashed. Keeps checking for newly added projects in config file.

**Usage:** (as Module)

```
var autoRun = require("node-auto-run");
var runner = new autoRun(config);
```

--------------------------------------

**Usage:** (as standalone node project)

```
  git clone https://github.com/animatedcreativity/node-auto-run
  cd node-auto-run
  npm update
  npm start
```

You can save a config file `node-auto-proxy.js` in parent folder of this node project as explained below.

-------------------------------------

**config**

- You can pass the config options right away when starting a new instance.
- There is `config.js` file in module itself for loading default options. But, this will get overwritten if you update the module.
- You can also add a `node-auto-proxy.js` file with config options in the current/parent folders of the module, so that config does not get overwritten each time you upgrade the module. Please check: https://www.npmjs.com/package/node-file-config
- Config options are refreshed from the files if any changes are found. No need to restart the project.

All config options are optional.
Example config:

```
{
  start: false,
  interval: 30000,
  checks: 2,
  projects: {
    ...
  }
}
```

- start: Whether to start the runner automatically. Useful if you are going to run the module as standalone node project.
- interval: Time in milliseconds to keep checking for if projects are alive or not.
- checks: Number of times to check before starting the crashed node project, just to be sure.
- projects: List of all projects in "<project_folder": "<project_name>" format.

Example config with projects:

```
{
  start: false,
  interval: 30000,
  checks: 2,
  projects: {
    "<project-folder-1>": "<project-name-1>",
    "<project-folder-2>": "<project-name-2>",
    "<project-folder-3>": "<project-name-3>"
  }
}
```

-----------------------------------

**Methods:**

Can be used if you run this as a module.  
All methods return promises.

*.exec(projectFolder)*

```
runner.exec("<project_folder>");
```

- Start a node project from the provided `projectFolder`.

*.processes()*

```
var list = runner.processes();
```

- Gets a list of all running node processes/projects on your system.

*.process(projectFolder)*

```
var process = runner.process("<project_folder>");
```

- Gets the process of node project from provided `projectFolder`, if its running.

*.config()*

```
var config = runner.config();
```

- Gets the config options in the config files as mentioned in the `config` section above. Useful to get if config is changed in the files.

--------------------------------------------

Fun part: what if the node project of this module itself gets crashed?

It will be good if you run this module as a standalone node project. Make 2 copies of the same module's node project and add each other into their config's project list. Or you can keep single configuration file for both, please check `config` section above. Start just one copy as it will take care of everything else.

Command to start:

```
nohup npm start --prefix /root/projects/node/node-auto-run /root/projects/node/node-auto-run 2>/dev/null 1>/dev/null & 
```

Yes, project folder is passed 2 times.  
First is prefix to start project from that folder.  
Second is argument to tell that the project is running.