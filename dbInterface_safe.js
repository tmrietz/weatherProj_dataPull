/**************************************************************************
 * dbInterface_safe.js
 * Author: Taylor Rietz
 * 
 * Simple functions that allow abstracted interfacing with a mysql database.
 * Functions exported in module.exports to be used modularly in other project
 * files. Interface includes:
 *  -createConn
 *  -runQuery
 *  -endConn
 * Connect -> runQuery -> printResults -> Close
 *  prerequisites: mysql database already initialized, Node.js 'mysql' package
 **************************************************************************/

var mysql = require('mysql');

 
/**************************************************************************
 * createConn:
 * Create and return a connection to mysql database. If connection is
 * successful, log a message that says so, otherwise log an error message.
 **************************************************************************/
module.exports.createConn = function createConn(){
    var conn = mysql.createConnection({
        host            : //'yours',
        user            : //'yours',
        password        : //'yours',
        database        : //'yours'
    });
    if(conn){
        console.log("Connection successful.");
        return conn;
    } else {
        console.log("Connection error.");
    }
}


/**************************************************************************
 * runQuery:
 * Accept a connection to a mysql database, a query string, and an array
 * of values to be used in the query. If the query is successful, log the
 * results object. If there was an error, log the query that resulted in
 * error, and also the error.
 **************************************************************************/
module.exports.runQuery = function runQuery(connectionObj, queryStr, valuesArr, func){
    function processResults(error, results, fields){
        if(!error){
            console.log("ID: ", results.insertId, "Affected rows: ", results.affectedRows, "Changed rows: ", results.changedRows);
            func(results);
        } else if(!error.fatal){
            console.log(error.sql);
            console.log(error.code);
            console.log(error.sqlMessage);
        } else if(error.fatal){
            console.log(error.fatal);
        }
    }
    connectionObj.query( queryStr, valuesArr, processResults);
}

/**************************************************************************
 * emptyCallback:
 * Because query results MUST be handled in a callback in conn.query, and
 * runQuery() wraps conn.query, we need to provide a query specific callback
 * to runQuery(), to then be used in the query callback, when selecting data. 
 * (read: callback hell)
 * When inserting or updating data, we provide a callback that just returns.
 **************************************************************************/
module.exports.emptyCallback = function emptyCallback(){return;}


/**************************************************************************
 * endConn:
 * Accept a connection to a mysql dataase. End that connection.
 **************************************************************************/
module.exports.endConn = function(connectionObj){
    connectionObj.end();
}

