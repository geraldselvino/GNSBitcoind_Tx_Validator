/******************************************************
* Copyright (c) 2018, Gerald Selvino 
* <gerald.selvino@protonmail.com> All rights reserved.
*
* The main node.js executable file.
*******************************************************/
var db = require ("./db.js");
var txObj1 = require ("./transactions-1.json");
var txObj2 = require ("./transactions-2.json");

var allTx = [txObj1, txObj2];

//Query the database to see if a record exists. Calls a callback
//depending on the result of the query
var queryExisting = function(querystring, cbparams, cbexists, cbnotexists) {
    var query = db.client.query(querystring);
    var isExists = false;
    query
    .on('error', 
    function(err) {
        console.error(err);
        db.client.end();
    })
    .on('result',
    function(row) {
        isExists = true;
    })
    .on('end',
    function() {
        if(isExists) {
            if (cbexists != null)
                cbexists(cbparams);
        } else {
            if (cbnotexists != null)
                cbnotexists(cbparams);
        }
    })
}

//Insert valid transactions to database
var insertTx = function(objparams) {
    db.client.query("INSERT INTO transactions(address,amount,txid,vout) VALUES(?,?,?,?)", 
    [objparams.address, objparams.amount, objparams.txid, objparams.vout], 
    function(err, result) {
        if (err) {
            db.client.end();
            console.error(err);
        }
    });
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

//The main function executed by the app timer below
//filters the valid transactions and call function
//to insert them in the database. 
var main = function(txtype, txobj) {
    for (var tx in txobj) {
        for (var txelem in txobj[tx].transactions) {
            if (txobj[tx].transactions[txelem].confirmations >= 6 //There must be at least 6 confirmations
                && txobj[tx].transactions[txelem].amount > 0 //Deposit amount must be greater than 0
                && isValidAmount(txobj[tx].transactions[txelem].amount)) { //Amount must have a maximum of 8 decimals, because it is the specs of Bitcoin
                
                var isTxTypeValid = false;
                switch (txtype) {
                    case "deposit":
                        if (txobj[tx].transactions[txelem].category == "receive" //Transaction is a deposit
                            || txobj[tx].transactions[txelem].category == "generate") { //Transaction is mined
                            isTxTypeValid = true;
                        }
                        break;
                    case "withdraw":
                        if (txobj[tx].transactions[txelem].category == "send") { //Transaction is a withdrawal
                            isTxTypeValid = true;
                        }
                        break;
                    default:
                        break;
                }
                
                if (isTxTypeValid) {
                    var address = txobj[tx].transactions[txelem].address;
                    var amount = Number(txobj[tx].transactions[txelem].amount.toFixed(8));
                    var txid = txobj[tx].transactions[txelem].txid;
                    var vout = txobj[tx].transactions[txelem].vout;
                    
                    //Check if there are duplicate entries already inserted in the database. In Bitcoin uniqueness is
                    //the combination of txid and vout, both must be unique to be able to say that it is a different transaction
                    queryExisting( "SELECT txid FROM transactions WHERE txid='" + txid + "' OR vout='" + vout + "'",
                                { address: address, amount: amount, txid: txid, vout: vout }, //Values to be inserted in db
                                null, //Callback if query exists
                                insertTx ); //Insert the values in db if query does not exists 
                }
            }
        }
    }
}

var timerhandle = setInterval(function() {
    if (db.status == "connected") {
        //main(message.txtype, message.data);
        main("deposit", allTx);
        console.log ("main executed");
        clearInterval(timerhandle);
    }
}, 500);
        
require('seneca')() //Uses Seneca framework to start our microservice
.add(
    {cmd: "filterValidBitcoinTx"},
    function(message, done) {
        //The app loop, Executes the main() only when 
        //we are connected to the database
        var timerhandle = setInterval(function() {
            if (db.status == "connected") {
                //main(message.txtype, message.data);
                main("deposit", allTx);
                console.log ("main executed");
                clearInterval(timerhandle);
            }
        }, 500);
        done(null, { success: true });
    }
    )
.listen()




