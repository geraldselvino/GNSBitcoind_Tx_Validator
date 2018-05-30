/******************************************************
* Copyright (c) 2018, Gerald Selvino 
* <gerald.selvino@protonmail.com> All rights reserved.
*
* The test driver js to call the microservice
* filterValidBitcoinTx and print the returned objects
* of txid's
*******************************************************/

var querystring = require('querystring');
var http = require('http');

var callRESt = function(message, method, data, success) {
    var dataString = JSON.stringify(data);
    var headers = {};
    var endpoint = message.endpoint;

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    } else {
        headers = {
            'Keep-Alive': 'timeout=15, max=5',
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };
    }

    var options = {
        host: message.host,
        port: message.port,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            var responseObject = {};
            try {
                responseObject = JSON.parse(responseString);
            } catch(exception) {
                console.error(exception.message);
            } finally {
                success(responseObject);
            }
        });
    });
    req.on('error', (err) => {
        console.error(err.message);
    });

    req.write(dataString);
    req.end();
}

var messageparam = {
    host: "localhost",
    endpoint: "/act?cmd=filterValidBitcoinTx&txtype=deposit",
    port: 10101
}

var callbackRESt = function(response) {
    console.log(response);
}

var txobj = require('./test-transactions.json');
callRESt(messageparam, "POST", txobj, callbackRESt);
