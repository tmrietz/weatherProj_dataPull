/**************************************************************************
 * schemaOperations.js
 * Author: Taylor Rietz
 * 
 * Schema level operations for NOAA data mysql database. Include sql queries
 * for table creation and table drops. This should be run once a database
 * instance is created, to generate the schemas. Drop queries and a clause
 * are included for convenience in case a full erase is easier, in the beginning.
 *  prerequisites: mysql database, './dbInterface.js' module
 **************************************************************************/

var dbInterface = require("./dbInterface_safe.js");

var createStationTable =    "create table station("+
                            "id int not null auto_increment,"+
                            "noaa_id varchar(32) not null,"+
                            "mindate date not null,"+
                            "maxdate date not null,"+
                            "name varchar(100),"+
                            "datacoverage decimal(10,6),"+
                            "elevation int,"+
                            "latitude decimal(10,6),"+
                            "longitude decimal(10,6),"+
                            "primary key(id),"+
                            "unique(noaa_id) )";

var createDatasetTable =   "create table dataset("+
                            "id int not null auto_increment,"+
                            "noaa_uid varchar(64) not null,"+
                            "noaa_id varchar(32) not null,"+
                            "mindate date not null,"+
                            "maxdate date not null,"+
                            "name varchar(100),"+
                            "datacoverage decimal(10,6),"+
                            "primary key(id),"+
                            "unique(noaa_uid),"+
                            "Unique(noaa_id) )";

var createDatacategoryTable =   "create table datacategory("+
                                "id int not null auto_increment,"+
                                "noaa_id varchar(32) not null,"+                                    
                                "name varchar(100),"+
                                "primary key(id),"+
                                "unique(noaa_id) )";

 
var createLocationcategoryTable =   "create table locationcategory("+
                                    "id int not null auto_increment,"+
                                    "noaa_id varchar(32) not null,"+                                    
                                    "name varchar(100),"+
                                    "primary key(id),"+
                                    "unique(noaa_id) )";


var createDatatypeTable =   "create table datatype("+
                            "id int not null auto_increment,"+
                            "noaa_id varchar(32) not null,"+
                            "mindate date not null,"+
                            "maxdate date not null,"+
                            "name text,"+
                            "datacoverage decimal(10,6),"+
                            "primary key(id),"+
                            "unique(noaa_id) )";

var createLocationTable =   "create table location("+
                            "id int not null auto_increment,"+
                            "noaa_id varchar(32) not null,"+
                            "mindate date not null,"+
                            "maxdate date not null,"+
                            "name varchar(100),"+
                            "datacoverage decimal(10,6),"+
                            "primary key(id),"+
                            "unique(noaa_id) )";

var createGSOMTable     =   "create table gsom("+
                            "id int not null auto_increment,"+
                            "datatype_id int not null,"+
                            "station_id int not null,"+
                            "date date not null,"+
                            "attributes text,"+
                            "value decimal(12,6),"+
                            "primary key(id),"+
                            "unique(datatype_id,station_id,date),"+
                            "foreign key(datatype_id) references datatype(id),"+
                            "foreign key(station_id) references station(id) )";

var dropStationTable = "drop table if exists station";
var dropDatasetTable = "drop table if exists dataset";
var dropDatacategoryTable = "drop table if exists datacategory";
var dropDatatypeTable = "drop table if exists datatype";
var dropLocationTable = "drop table if exists location";
var dropLocationcategoryTable = "drop table if exists locationcategory";
var dropGSOMTable = "drop table if exists gsom";


var createSchema = {
    station: createStationTable,
    dataset: createDatasetTable,
    datacategory: createDatacategoryTable,
    datatypes: createDatatypeTable,
    locations: createLocationTable,
    locationcategory: createLocationcategoryTable,
    gsom: createGSOMTable
};
module.exports.createSchema = createSchema;

var dropSchema = {
    station: dropStationTable,
    datasets: dropDatasetTable,
    datacategory: dropDatacategoryTable,
    datatype: dropDatatypeTable,
    location: dropLocationTable,
    locationcategory: dropLocationcategoryTable,
    gsom: dropGSOMTable  
};
module.exports.dropSchema = dropSchema;


function singleTableOperation(queryStr){
    var conn = dbInterface.createConn();
    dbInterface.runQuery(conn, queryStr, [], dbInterface.emptyCallback);
    dbInterface.endConn(conn);
}


module.exports.dropTables = function dropTables(){
    var conn = dbInterface.createConn();
    for(elem in dropSchema){
        dbInterface.runQuery(conn, dropSchema[elem], [], dbInterface.emptyCallback);
    }
    dbInterface.endConn(conn);
}


module.exports.createTables = function createTables(){
    var conn = dbInterface.createConn();
    for(elem in createSchema){
        dbInterface.runQuery(conn, createSchema[elem], [], dbInterface.emptyCallback);
    }
    dbInterface.endConn(conn);
}


//singleTableOperation(dropSchema.gsom);
//singleTableOperation(createSchema.gsom);