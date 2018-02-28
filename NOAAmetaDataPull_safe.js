var request = require("request-promise");                           //FOR ASYNCHRONOUS API CALLS VIA NODE
var req = require("request");                                       //ASYNCHRONOUS API CALLS WITHOUT PROMISES
var dbInterface = require("./dbInterface.js");
var rowParser = require("./rowParser.js");
var apiKey = "YOUR KEY HERE";                                       //NOAA KEY

//CREATE REQUEST OPTIONS OBJECT
function buildRequestObj(inpMethod, inpURL, endpoint, paramsObj, apiKey){
    var reqObject = {
        method: inpMethod,
        url: inpURL + endpoint,
        qs: paramsObj,                                   //refer to NOAA API documentation to get list of params for each dataset
        headers: {"token": apiKey}
    };
    return reqObject;
}


//MAKE A SINGLE ASYNCHRONOUS CALL, WAIT FOR THE RESPONSE, AND INSERT EACH OBSERVATION INTO TABLE
function callNOAA(endpoint, params, apiKey){
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);

    request(reqOptions)                                  //async with promises
        .then(
            function(body){
                var data = JSON.parse(body);
                var conn = dbInterface.createConn();
                //console.log(data.results);
                for(var elem in data.results){
                    var queryObj = rowParser.makeRow(endpoint, data.results[elem]);
                    rowParser.insertRow(conn, endpoint, queryObj);
                }
                dbInterface.endConn(conn);
                //console.log(data);                      //print data to console.
            }
        )
        .catch(
            function(err){
                if(reqOptions.params){
                    var keys = Object.keys(reqOptions.params);                
                }
                console.log(err);
                console.log("Failed on: ");                                            //output URL to retry a pull for missed data
                for(var key in keys){
                    console.log(reqOptions.url);
                    console.log(keys[key] + ": " + reqOptions.params[keys[key]]);      //if it fails, log the url and params
                }
            }
        )
}


//DRIVER FUNCTION FOR ENTIRE DATASET PULL
//GETS COUNT OF DATA RETURNED, WHERE COUNT GETS USED IN THROTTLED CALL LOOP
function getData(endpoint, params, apiKey){
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);
    console.log(reqOptions);

    function sendRequests(error, response, body){
        if(! JSON.parse(body)){
            console.log(body);
        } else {
            var data = JSON.parse(body);
            //console.log(data);
            var count = data.metadata.resultset.count;                  //get count of entire dataset using metadata count obj
            callDriver(endpoint, params, count);                        //pass count to continuousCall, where it will be used to clear throttle interval
        }
    }
    req(reqOptions, sendRequests);                                      //simple async request, no promises
}


//USING DATASET COUNT, MANIPULATE OFFSET TO PULL UNTIL COMPLETE. 
//ADDS INTERVAL TIMEOUT TO THROTTLE API CALLS (limit is 5/s)
function callDriver(endpoint, params, count){
    var counter = 0;                                                    
    var interval = setInterval(doCall, 400);                            //leaves a 100ms buffer to ensure no failures due to rate limit

    function doCall(){
        if( counter >= (count/params.limit-1) ){                        //(count/1000 - 1) for 128000 is 127
            clearInterval(interval);                                    //if we have requested all the data in our set, clear the interval to stop further requests
        }     
        params.offset = counter*params.limit+1;                              
        callNOAA(endpoint, params, apiKey);                             //offset increases by limit param each call        
        counter++;
    }
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