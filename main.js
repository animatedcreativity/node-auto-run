var start = function() {
  var ps = require("ps-node");
  ps.lookup({command: 'node', arguments: ''}, function(err, resultList ) {
    console.log(resultList);
    if (err) {
        throw new Error( err );
    }
    resultList.forEach(function( process ){
        if( process ){

            console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
        }
    });
  });
};
setTimeout(function() {
  start();
}, 1000);