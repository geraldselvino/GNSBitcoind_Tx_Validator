# GNSBitcoind_Tx_Validator
A Node.js microservice to filter and check for valid transactions from Bitcoind (https://en.bitcoin.it/wiki/Bitcoind) then stores those valid Tx on a database. Then it returns a JSON containing the transaction id's of the inserted records. It can be run natively or dockerized (the docker scripts are provided)

# Requirement
To run it in a container, you need docker and docker-compose. All dependencies will be handled by docker.

To run it in stand-alone, you need node.js, npm, mysql for node, seneca framework

# Installation
- Clone this repository i.e. `git clone https://github.com/geraldselvino/GNSBitcoind_Tx_Validator` 
- Go to command line and change to cloned directory 

**Docker** 
- Type `docker-compose up` to build and start the microservice 

**Stand-alone** 
- Change the host property in dbconfig.js to your hostname 
- Type `npm install` 
- Type `npm start` to start the microservice 

# Usage
- Call it like you would call any RESt APIs `http://<host>:10101/act?cmd=filterValidBitcoinTx&txtype=<deposit | withdraw>` and POST in the Http body the JSON object lists of transactions like the output of Bitcoind. 

e.g.
```javascript
var datastr = JSON.stringify(dataobj); //Where dataobj is the transactions object from Bitcoind
var headers = {
    'Content-Type': 'application/json',
    'Content-Length': datastr.length
};
var options = {
    host: localhost,
    port: 10101,
    path: "/act?cmd=filterValidBitcoinTx&txtype=deposit"
    method: "POST",
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
            callback(responseObject); //Your callback method to handle the object result. Or handle it in this block
        }
    });
});
req.on('error', function(err) {
    console.error(err.message);
});
req.write(datastr);
req.end();
```

Check the test folder for a working client driver for this microservice. Simply run the microservice then run the client to see how it works.

e.g.
- Open a terminal in the repo directory `docker-compose up`
- Open a new terminal then type `node test/test.js`
