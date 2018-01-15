var request = require("request-promise");          //FOR ASYNCHRONOUS API CALLS VIA NODE
var req = require("request");
var apiKey ="use your own key";     //NOAA KEY


function callNOAA(limit, offset, endpoint, meta, apiKey){
    var noaaURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/"+endpoint;
    if(meta == false){
        var noaaURL = noaaURL+ "?&includemetadata=false";
    }
    var params = {
        'limit': limit,
        'offset': offset
    };
    var options = {
        method: "GET",
        url: noaaURL,
        qs: params,
        headers: {"token": apiKey}
    };

    request(options)                            //async
        .then(function(body){
            var data = JSON.parse(body);
            //results = data.results;
            if(!data.results){
                console.log("done.");
            }
            console.log(data);
            return data;
            //SQL insertion clause here
        })
        .catch(function(err){
            console.log(err);
            console.log("Failed on: " + noaaURL, params);       //output URL to retry a pull for missed data
        })
}


function getData(limit, offset, endpoint, meta, apiKey){
    var noaaURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/"+endpoint;         //create the URL with specified endpoint
    if(meta == false){
        var noaaURL = noaaURL+ "?&includemetadata=false";
    }
    var params = {
        'limit': limit,
        'offset': offset
    };
    var options = {
        method: "GET",
        url: noaaURL,
        qs: params,
        headers: {"token": apiKey}
    };

    function sendRequests(error, response, body){
        var data = JSON.parse(body);
        var count = data.metadata.resultset.count;              //get count of entire dataset using metadata
        continuousCall(limit, endpoint, meta, count);           //pass count to continuousCall, where it will be used to clear throttle interval
    }
    req(options, sendRequests);
}


//ADD INTERVAL TIMEOUT TO THROTTLE API CALLS (limit is 5/s)
function continuousCall(limit, endpoint, meta, count){
    var counter = 0;                                                    
    var interval = setInterval(doCall, 300);                            //leaves a 100ms buffer to ensure no failures due to rate limit

    function doCall(){
        if( counter >= (count/1000)-1 ){                                //(count/1000 - 1) for 128000 is 127
            clearInterval(interval);                                    //if we have requested all the data in our set, clear the interval to stop further requests
        }
        callNOAA(limit, counter*limit+1, endpoint, meta, apiKey);       //counter increases by 1000 each call
        counter++;
    }
}


getData(1000, 1, "stations", false, apiKey);