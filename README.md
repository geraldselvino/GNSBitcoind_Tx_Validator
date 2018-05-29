# GNSBitcoind_Tx_Validator
A simple microservice to filter and check for valid transactions from bitcoind (https://en.bitcoin.it/wiki/Bitcoind) then stores those valid Tx on a database. It can be run natively or dockerized (the docker scripts are provided)

# Requirement
To run it in a container, you need docker and docker-compose. All dependencies will be handled by docker then.

To run it in stand-alone, you need node.js, npm, mysql for node, seneca framework

# Installation
- Clone this repository i.e. git clone https://github.com/geraldselvino/GNSBitcoind_Tx_Validator 
- Go to command line and change to cloned directory 
**Docker** 
- Type docker-compose up to start the microservice 

**Stand-alone** 
- Changed the host property in dbconfig.js to your hostname 
- Type npm install 
- Type npm start to start the microservice 

# Usage
- Call this URI like you would call any RESt APIs http://<host>:10101/act?cmd=filterValidBitcoinTx&txtype=<deposit | withdraw> and POST in the Http body the JSON object lists of transactions like the output of Bitcoind. 

e.g.
```javascript
var datastr = JSON.stringify(dataobj); //Where dataobj is the transactions object from Bitcoind
var headers = {
    'Content-Type': 'application/json',
    'Content-Length': datastr.length
};
var options = {
    host: localhost:10101,
    path: "/act?cmd=filterValidBitcoinTx&txtype=deposit"
    method: "POST",
    headers: headers
};
var req = https.request(options, function(res) {
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
req.on('error', function(err) {
    console.error(err.message);
});
req.write(datastr);
req.end();
```
