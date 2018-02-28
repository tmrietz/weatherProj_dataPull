/**************************************************************************
 * insertOperations.js
 * Author: Taylor Rietz
 * 
 * Simple functions that allow NOAA data insertion into a mysql database.
 * Functions exported in module.exports to be used modularly in other project
 * files. Insertion currently supported for the following tables:
 *  -station, dataset, datacategory, locationcategory, datatype, location
 * There is an existing dependency between insertion fields and insertion object
 * ordering.
 *  prerequisites: mysql database, './dbInterface.js' module
 **************************************************************************/

var dbInterface = require("./dbInterface.js");


/**************************************************************************
 * station:
 * Accepts a mysql database connection, and a station object from NOAA API
 * call. Inserts a single station object into table called 'station'. Single
 * row insertion.
 **************************************************************************/
module.exports.station = function stationInsert(connectionObj, stationObj){
    var query = "insert into station "+
                "(noaa_id,mindate,maxdate,name,datacoverage,elevation,latitude,longitude) "+
                "values "+
                "(?,?,?,?,?,?,?,?)";
    dbInterface.runQuery(connectionObj, query, stationObj);
}


/**************************************************************************
 * dataset:
 * Accepts a mysql database connection, and a dataset object from NOAA API
 * call. Inserts a single dataset object into table called 'dataset'. Single
 * row insertion.
 **************************************************************************/
module.exports.dataset = function datasetInsert(connectionObj, datasetObj){
    var query = "insert into dataset "+
                "(noaa_uid,noaa_id,mindate,maxdate,name,datacoverage) "+
                "values "+
                "(?,?,?,?,?,?)";
    dbInterface.runQuery(connectionObj, query, datasetObj);
}


/**************************************************************************
 * datacategory:
 * Accepts a mysql database connection, and a datacategory object from NOAA API
 * call. Inserts a single datacategory object into table called 'datacategory'. 
 * Single row insertion.
 **************************************************************************/
module.exports.datacategory = function datacategoryInsert(connectionObj, datacategoryObj){
    var query = "insert into datacategory "+
                "(noaa_id,name) "+
                "values "+
                "(?,?)";
    dbInterface.runQuery(connectionObj, query, datacategoryObj);
}


/**************************************************************************
 * locationcategory:
 * Accepts a mysql database connection, and a locationcategory object from NOAA API
 * call. Inserts a single locationcategory object into table called 'locationcategory'. 
 * Single row insertion.
 **************************************************************************/
module.exports.locationcategory = function locationcategoryInsert(connectionObj, locationcategoryObj){
    var query = "insert into locationcategory "+
                "(noaa_id,name) "+
                "values "+
                "(?,?)";
    dbInterface.runQuery(connectionObj, query, locationcategoryObj);
}


/**************************************************************************
 * datatype:
 * Accepts a mysql database connection, and a datatype object from NOAA API
 * call. Inserts a single datatype object into table called 'datatype'. 
 * Single row insertion.
 **************************************************************************/
module.exports.datatype = function datatypeInsert(connectionObj, datatypeObj){
    var query = "insert into datatype "+
                "(noaa_id,mindate,maxdate,name,datacoverage) "+
                "values "+
                "(?,?,?,?,?)";
    dbInterface.runQuery(connectionObj, query, datatypeObj);
}


/**************************************************************************
 * location:
 * Accepts a mysql database connection, and a location object from NOAA API
 * call. Inserts a single location object into table called 'location'. 
 * Single row insertion.
 **************************************************************************/
module.exports.location = function locationInsert(connectionObj, locationObj){
    var query = "insert into location "+
                "(noaa_id,mindate,maxdate,name,datacoverage) "+
                "values "+
                "(?,?,?,?,?)";
    dbInterface.runQuery(connectionObj, query, locationObj);
}

