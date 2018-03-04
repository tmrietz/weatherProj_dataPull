/******************************************************************************************************************
 * NOAAmetaDataPull_safe.js
 * Author: Taylor Rietz
 * 
 * The goal is to be able to pull data from the NOAA API in an asynchronous,
 * rate-limited fashion using primarily promises rather than callbacks. Notes:
 *      -NOAA API returns response metadata if requested, including total count
 *      -NOAA API limits response volume to max of 1000 entities per call
 *      -NOAA API is largely dependent on endpoint string, so would be extremely surprising if endpoint strings 
 *      were changed
 *      -NOAA API is rate-limited to 5 calls per second, per token, though in reality it limits to ~300ms/call
 * 
 * To pull data thoroughly and confidently, from a high level this works as follows:
 *      1) Pass an endpoint, API query parameter object, and API token string to driver function getData()
 *      2) getData() builds request object containing parameters, including API token
 *      3) A single call is made to the API with the created query to extract entity count from metadata in response
 *      4) Using the count from metadata response, makeCalls() sets a request interval and makes correct number of 
 *      async calls to API so that all results, and no empty result sets, are returned
 *      5) asyncCall() parses the returned data and inserts into database using promises and './rowParser.js'
 ******************************************************************************************************************/

var request = require("request-promise");           //used for asynchronous, promise-based calls
var req = require("request");                       //used for asynchronous, non-promise-based calls
var dbInterface = require("./dbInterface_safe.js"); //simple interface to mysql database
var rowParser = require("./rowParser.js");          //NOAA API-specific row parsing and sql inserting
var apiKey = "YOUR KEY HERE";    //NOAA token


/**************************************************************************
 * buildRequestObj:
 * Create and return a request object to make calls to NOAA API.
 * Requires: call method, base url, enpoint string, query parameters object, and API token
 **************************************************************************/
function buildRequestObj(inpMethod, inpURL, endpoint, paramsObj, apiKey){
    var reqObject = {
        method: inpMethod,                          //GET,POST...
        url: inpURL + endpoint,                     //create a base url out of API url and endpoint string
        qs: paramsObj,                              //refer to NOAA API documentation to get list of params for each dataset
        headers: {"token": apiKey}
    };
    return reqObject;
}


/**************************************************************************
 * asyncCall:
 * Creates a request object via buildRequestObj. Makes an asynchronous request
 * with those parameters, and using promises, creates a row per response entity
 * and inserts the row into the correct table in the database. Logs failed
 * requests and parameters to retry at a later time.
 **************************************************************************/
function asyncCall(endpoint, params, apiKey){
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);

    request(reqOptions)                                 //async with promises
        .then(
            function(body){
                var data = JSON.parse(body);
                //console.log(data.results);
                var conn = dbInterface.createConn();    //connect to mysql database
                for(var elem in data.results){
                    var queryObj = rowParser.makeRow(endpoint, data.results[elem]);     //create a row to be inserted
                    rowParser.insertRow(conn, endpoint, queryObj);                      //insert row to correct table
                }
                dbInterface.endConn(conn);              //close connection to mysql database
            }
        )
        .catch(
            function(err){
                if(reqOptions.params){
                    var keys = Object.keys(reqOptions.params);                
                }
                console.log(err);
                console.log("Failed on: ");        
                console.log(reqOptions.url);        //output URL to retry a pull for missed data
                for(var key in keys){
                    console.log(keys[key] + ": " + reqOptions.params[keys[key]]);      //if it fails, log the url and params
                }
            }
        )
}


/**************************************************************************
 * makeCalls:
 * Sets interval for calls to 400ms. API docs claim 5 per second, though closer
 * to 300ms/call.
 *      limitCalls(): clears the interval when count of calls made is the final call.
 *          -final call is determined by count from getResponseCount(), divided by one less than the limit (index logic)
 * After each call, increases the call offset by the limit + 1 (if 1000 entities pulled, next offset = 1001)
 **************************************************************************/
function makeCalls(endpoint, params, count){
    var counter = 0;                                                    
    var interval = setInterval(limitCalls, 400);    //leaves a 100ms buffer to ensure no failures due to rate limit

    function limitCalls(){
        if( counter >= (count/params.limit-1) ){    //(count/1000 - 1) for 128000 is 127
            clearInterval(interval);                //if we have requested all the data in our set, clear the interval to stop further requests
        }     
        params.offset = counter*params.limit+1;                              
        asyncCall(endpoint, params, apiKey);        //offset increases by limit param each call        
        counter++;
    }
}


/**************************************************************************
 * getData:
 * Driver function for making calls and extracting API data and loading into mysql database.
 * 1) Creates an initial, non-promised request exclusively for pulling full response count from metadata -> getResponseCount()
 * 2) Pass the count to makeCalls(), which will drive asyncCall() on an interval, rate-limit requests, and limit
 * requests to the exact and full response count
 **************************************************************************/
function getData(endpoint, params, apiKey){
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);
    console.log(reqOptions);

    function getResponseCount(error, response, body){
        if(! JSON.parse(body)){
            console.log(error);
        } else {
            var data = JSON.parse(body);
            //console.log(data);
            var count = data.metadata.resultset.count;      //get count of entire dataset using metadata count obj
            makeCalls(endpoint, params, count);             //pass count to continuousCall, where it will be used to clear throttle interval
        }
    }
    req(reqOptions, getResponseCount);                      //simple async request, no promises
}


/*
var params = {
    //datasetid: 'GSOM',
    //startdate: '2017-12-01',
    //enddate: '2018-01-01',
    limit: 1000,
    offset: 1,
    includemetadata: 'true'
};
*/

/*EACH OF THESE CAN BE RUN ONE AT A TIME RIGHT NOW*/
//getData("stations", params, apiKey);
//getData("datasets", params, apiKey);
//getData("datacategories", params, apiKey);
//getData("datatypes", params, apiKey);
//getData("locationcategories", params, apiKey);
//getData("locations", params, apiKey);
//getData("data", params, apiKey);
