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

var dbInterface = require("./dbInterface.js");

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

var dropStationTable = "drop table if exists station";
var dropDatasetTable = "drop table if exists dataset";
var dropDatacategoryTable = "drop table if exists datacategory";
var dropDatatypeTable = "drop table if exists datatype";
var dropLocationTable = "drop table if exists location";
var dropLocationcategoryTable = "drop table if exists locationcategory";

var createSchema = {
    station: createStationTable,
    dataset: createDatasetTable,
    datacategory: createDatacategoryTable,
    datatypes: createDatatypeTable,
    locations: createLocationTable,
    locationcategory: createLocationcategoryTable
};

var dropSchema = {
    station: dropStationTable,
    datasets: dropDatasetTable,
    datacategory: dropDatacategoryTable,
    datatype: dropDatatypeTable,
    location: dropLocationTable,
    locationcategory: dropLocationcategoryTable  
};


function dropTables(){
    var conn = dbInterface.createConn();
    for(elem in dropSchema){
        dbInterface.runQuery(conn, dropSchema[elem], []);
    }
    dbInterface.endConn(conn);
}


function createTables(){
    var conn = dbInterface.createConn();
    for(elem in createSchema){
        dbInterface.runQuery(conn, createSchema[elem], []);
    }
    dbInterface.endConn(conn);
}

//dropTables();       //run to reset all tables
createTables();
