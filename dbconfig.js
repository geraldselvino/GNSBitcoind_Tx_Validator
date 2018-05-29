/*******************************************************
* Copyright (c) 2018, Gerald Selvino 
* <gerald.selvino@protonmail.com> All rights reserved.
*
* This is the database configuration file. 
* Compatible for MySQL and MariaDB.
********************************************************/
var config = {
    user: "btxvalidator-user", 
    database: "btxvalidator-db", 
    password: "btxvalidator-pass", 
    host: 'db', //db is linked in docker-compose.yml so it is what to use here instead of localhost
                //so that the dockerized BitcoindTxValidator service can connect to the dockerized mariadb
    port: 3306, 
    connectionLimit: 10
};

module.exports = config;
