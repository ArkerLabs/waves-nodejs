'use strict'

var request = require('request');

var http = {};

http.post = function(url, headers, body) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: url,
            headers: headers,
            body: body            
        };
        
        function callback(error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                resolve(JSON.parse(body));
            } else {
                reject(body);
            }
        }
        
        request.post(options, callback);
    });
    
}

http.get = function(url, headers) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: url,
            headers: headers
        };
        
        function callback(error, response, body) {
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                resolve(JSON.parse(body));
            } else {
                reject(body);
            }
        }
        
        request.get(options, callback);
    });
    
}

module.exports = http;