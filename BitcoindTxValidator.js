/******************************************************
* Copyright (c) 2018, Gerald Selvino 
* <gerald.selvino@protonmail.com> All rights reserved.
*
* The main node.js executable file. Listens at port
* 10101 for call to service filterValidBitcoinTx.
* It then parse the JSON object from the POST request
* and check for valid bitcoin transactions. Pushes
* those valid transactions to the database
*******************************************************/
var db = require ("./db.js");
var returnObj = [];
var currentInsertTx = {index: 0};

//Query the database to see if a record exists. Calls a callback
//depending on the result of the query
var queryExisting = function(querystring, txparams) {
    setTimeout(function() {
        var query = db.client.query(querystring);
        query
        .on('error', 
        function(err) {
            console.error(err);
            db.client.end();
        })
        .on('result',
        function(row) {
            txparams.isExists = true;
            ++currentInsertTx.index;
        })
        .on('end',
        function() {
            if(txparams.isExists === null) {
                txparams.isExists = false;
            }
        })
    }, 110 * txparams.txCounter);
}

//Insert valid transactions to database
var insertTx = function(objparams, txparams) {
    var intervalHandle = setInterval(function() {
        if (txparams.isExists !== undefined
            && txparams.isExists !== null) {
            if (txparams.isExists === false) {
                db.client.query("INSERT INTO transactions(address,amount,txid,vout) VALUES(?,?,?,?)", 
                [objparams.address, objparams.amount, objparams.txid, objparams.vout], 
                function(err, result) {
                    if (err) {
                        db.client.end();
                        console.error(err);
                    }
                    returnObj.push({txid: objparams.txid});
                    ++currentInsertTx.index;
                });
            }
            clearInterval(intervalHandle);
        }
    }, 100);
}

//Method to check if the number of digits in the amount is valid,
//must be a maximum of 8 for Bitcoin
var isValidAmount =  function(amount) {
    var isvalid = true;
    var stramount = amount.toString();
    stramount = stramount.substring(stramount.indexOf(".") + 1, stramount.length);

    if (stramount.length > 8)
        isvalid = false;

    return isvalid;
}

//The main function executed by the service below
//filters the valid transactions and insert them
//to the database. 
var main = function(txtype, txobj) {
    var txCounter = 0;
    var txExists = [];
    for (var txelem in txobj) {
        if (txobj[txelem].confirmations >= 6 //There must be at least 6 confirmations
            && txobj[txelem].amount > 0 //Deposit amount must be greater than 0
            && isValidAmount(txobj[txelem].amount)) { //Amount must have a maximum of 8 decimals, because it is the specs of Bitcoin
            
            var isTxTypeValid = false;
            switch (txtype) {
                case "deposit":
                    if (txobj[txelem].category == "receive" //Transaction is a deposit
                        || txobj[txelem].category == "generate") { //Transaction is mined
                        isTxTypeValid = true;
                    }
                    break;
                case "withdraw":
                    if (txobj[txelem].category == "send") { //Transaction is a withdrawal
                        isTxTypeValid = true;
                    }
                    break;
                default:
                    break;
            }
            
            if (isTxTypeValid) {
                var address = txobj[txelem].address;
                var amount = Number(txobj[txelem].amount.toFixed(8));
                var txid = txobj[txelem].txid;
                var vout = txobj[txelem].vout;
                txExists.push({isExists: null, txCounter: txCounter});
                //Check if there are duplicate entries already inserted in the database. In Bitcoin, uniqueness is
                //the combination of txid and vout, both must be unique to be able to say that it is a different transaction
                queryExisting("SELECT txid FROM transactions WHERE txid='" + txid + "' OR vout=" + vout,
                               txExists[txCounter]);
                
                //Routine to check the isExists flag of each transaction and perform an insert
                //in the database if the flag is false. It is being set in the function queryExisting
                insertTx({address: address, amount: amount, txid: txid, vout: vout}, txExists[txCounter]); //Insert the values in db if query does not exists

                ++txCounter;
            }
        }
    }
    return txCounter;
}

require('seneca')() //Uses Seneca framework to start our microservice
.add(
    {cmd: "filterValidBitcoinTx"},
    function(message, done) {
        //The app loop, Executes the main() only when 
        //we are connected to the database
        var timerhandle = setInterval(function() {
            if (db.status == "connected") {
                var txCount = main(message.txtype, message.transactions);
                clearInterval(timerhandle);
                checkerHandle = setInterval(function() {
                    if (txCount == currentInsertTx.index) {
                        console.log("Returning a JSON object");
                        done(null, returnObj);
                        clearInterval(checkerHandle);
                    }
                }, 500);
            }
        }, 500);
    }
    )
.listen()




