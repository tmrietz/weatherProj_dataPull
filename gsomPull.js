var callOperations = require("./callOperations_safe.js");
var dbInterface = require("./dbInterface_safe.js");


var dataset_mindate = "select mindate as date from dataset where noaa_id = ?";
var gsom_mindate = "select max(date) as date from gsom";

function handle(results){
    if(results[0].date){
        var start = new Date(results[0].date);
        var startStr = start.toISOString().split('T')[0];        //must overlap to make sure to include all data for each month
        var endStr = new Date(start.getFullYear(), start.getMonth()+1, start.getDate()).toISOString().split('T')[0];
    }

    var params = {
        datasetid: 'GSOM',
        startdate: startStr,
        enddate: endStr,
        limit: 1000,
        offset: 1,
        includemetadata: 'true'
    };
    callOperations.getData("data", params, callOperations.apiKey);
};

/*
var conn = dbInterface.createConn();
dbInterface.runQuery(conn, dataset_mindate, ['GSOM'], handle);
dbInterface.endConn(conn);
*/

var conn = dbInterface.createConn();
dbInterface.runQuery(conn, gsom_mindate, [], handle);
dbInterface.endConn(conn);
