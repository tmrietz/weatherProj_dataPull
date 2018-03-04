var callOperations = require("./callOperations_safe.js");

var params = {
    limit: 1000,
    offset: 1,
    includemetadata: 'true'
};

callOperations.getData("datasets", params, callOperations.apiKey);