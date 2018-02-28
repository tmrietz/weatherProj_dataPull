/**************************************************************************
 * rowParser.js
 * Author: Taylor Rietz
 * 
 * The general idea is to take the endpoint string in calls to NOAA API,
 * and based on the endpoint, take a single JSON object from data.results response
 * and create the query array to be passed to the insertion query. The same 
 * API endpoint based logic is used to determine which table to insert a row into.
 * Functions included in module.exports include:
 * -makeRow: creates the query array to be passed to insertion clause
 * -insertRow: inserts a query array (results object) into correct table
 *  prerequisites: mysql database, './insertOperations.js' module
 **************************************************************************/

var insertOperations = require('./insertOperations.js');


/**************************************************************************
 * makeRow:
 * Accepts an endpoint from NOAA API docs, and a single JSON object from
 * data.results response from call to NOAA API. Creates a query array,
 * based on an endpoint string, to be passed to insertRow().
 **************************************************************************/
module.exports.makeRow = function makeRow(endpointStr, resultsObj){
    var queryArr;           //initialize queryArr
    switch(endpointStr){
        
        case 'stations':
            queryArr = [resultsObj.id, 
                        resultsObj.mindate,
                        resultsObj.maxdate,
                        resultsObj.name,
                        resultsObj.datacoverage,
                        resultsObj.elevation,
                        resultsObj.latitude,
                        resultsObj.longitude
                        ];
        break;

        case 'datasets':
            queryArr = [resultsObj.uid,
                        resultsObj.id,
                        resultsObj.mindate,
                        resultsObj.maxdate,
                        resultsObj.name,
                        resultsObj.datacoverage
                        ];
        break;

        case 'datacategories':
            queryArr = [resultsObj.id,
                        resultsObj.name
                        ];
        break;

        case 'locationcategories':
            queryArr = [resultsObj.id,
                        resultsObj.name
                        ];
        break;

        case 'datatypes':
            queryArr = [resultsObj.id,
                        resultsObj.mindate,
                        resultsObj.maxdate,
                        resultsObj.name,
                        resultsObj.datacoverage
                        ];
        break;

        case 'locations':
            queryArr = [resultsObj.id,
                        resultsObj.mindate,
                        resultsObj.maxdate,
                        resultsObj.name,
                        resultsObj.datacoverage
                        ];
        break;

        //case 'data': FURTHER TO WRITE, BASED ON ACTUAL DATASETS TO PULL DATA FROM
    }
    return queryArr;
}


/**************************************************************************
 * insertRow:
 * Accepts a mysql database connection, an endpoint string from NOAA API docs, 
 * and a query array created from a single JSON object returned from call to that
 * NOAA API endpoint. Inserts data from that query array into the correct table, 
 * based on the API endpoint. 
 **************************************************************************/
module.exports.insertRow = function insertRow(connectionObj, endpoint, queryArr){
    switch(endpoint){

        case 'stations': //insert into station table
            insertOperations.station(connectionObj, queryArr);
        break;

        case 'datasets': //insert into dataset table
            insertOperations.dataset(connectionObj, queryArr);
        break;

        case 'datacategories': //insert into datacategory table
            insertOperations.datacategory(connectionObj, queryArr);
        break;

        case 'locationcategories': //insert into locationcategory table
            insertOperations.locationcategory(connectionObj, queryArr);
        break;

        case 'datatypes': //insert into datatype table
            insertOperations.datatype(connectionObj, queryArr);
        break;

        case 'locations': //insert into location table
            insertOperations.location(connectionObj, queryArr);
        break;
        
    }
}