

var request = require("request-promise");                           //FOR ASYNCHRONOUS API CALLS VIA NODE
var req = require("request");                                       //ASYNCHRONOUS API CALLS WITHOUT PROMISES
var apiKey = "PutYourKeyHere";                                      //NOAA KEY


//CREATE REQUEST OPTIONS OBJECT
function buildRequestObj(inpMethod, inpURL, endpoint, paramsObj, apiKey){
    var reqObject = {
        method: inpMethod,
        url: inpURL + endpoint,
        qs: paramsObj,                              //refer to NOAA API documentation to get list of params for each dataset
        headers: {"token": apiKey}
    };
    return reqObject;
}


//MAKE A SINGLE ASYNCHRONOUS CALL, WAIT FOR THE RESPONSE, AND INSERT EACH OBSERVATION INTO TABLE
function callNOAA(limit, offset, endpoint, apiKey){
    var params = {
        //'datasetid': 'GSOM', 
        'limit': limit,
        'offset': offset,
        //'startdate': '2017-01-20',
        //'enddate': '2017-02-20'
    };
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);

    request(reqOptions)                             //async with promises
        .then(function(body){
            var data = JSON.parse(body);
            console.log(data);                      //print data to console.
            //SQL insertion clause here
        })
        .catch(function(err){
            if(reqOptions.params){
                var keys = Object.keys(reqOptions.params);                
            }
            console.log(err);
            console.log("Failed on: ");                             //output URL to retry a pull for missed data
            for(var key in keys){
                console.log(reqOptions.url);
                console.log(keys[key] + ": " + params[keys[key]]);      //if it fails, log the url and params
            }
        })
}


//DRIVER FUNCTION FOR ENTIRE DATASET PULL
function getData(limit, offset, endpoint, apiKey){
    var key = apiKey;
    var params = {
        //'datasetid': 'GSOM', 
        'limit': limit,
        'offset': offset,
        //'startdate': '2017-01-20',
        //'enddate': '2017-02-20'
    };
    var reqOptions = buildRequestObj("GET", "https://www.ncdc.noaa.gov/cdo-web/api/v2/", endpoint, params, apiKey);
    
    function sendRequests(error, response, body){
        var data = JSON.parse(body);
        var count = data.metadata.resultset.count;              //get count of entire dataset using metadata count obj
        continuousCall(limit, endpoint, count);                 //pass count to continuousCall, where it will be used to clear throttle interval
    }
    req(reqOptions, sendRequests);                              //simple async request, no promises
}


//USING DATASET COUNT, MANIPULATE OFFSET TO PULL UNTIL COMPLETE. 
//ADDS INTERVAL TIMEOUT TO THROTTLE API CALLS (limit is 5/s)
function continuousCall(limit, endpoint,  count){
    var counter = 0;                                                    
    var interval = setInterval(doCall, 300);                            //leaves a 100ms buffer to ensure no failures due to rate limit

    function doCall(){
        if( counter >= (count/1000)-1 ){                                //(count/1000 - 1) for 128000 is 127
            clearInterval(interval);                                    //if we have requested all the data in our set, clear the interval to stop further requests
        }     
        var offset = counter*limit+1;                              
        callNOAA(limit, offset, endpoint, apiKey);             //offset increases by limit param each call        
        counter++;
    }
}


getData(1000, 1, "stations", apiKey);
//getData(1000, 1, "datasets", apiKey);
//getData(1000, 1, "datacategories", apiKey);
//getData(1000, 1, "datatypes", apiKey);
//getData(1000, 1, "locationcategories", apiKey);
//getData(1000, 1, "locations", apiKey);
//getData(1000, 1, "data", apiKey);