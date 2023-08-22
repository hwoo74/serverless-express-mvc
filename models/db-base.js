const mysql = require('mysql2');
const CustomError = require('../libs/custom-error');
const CustomErrorCode = require('../libs/custom-error-code');  // set custom error code. 
var GlobalVar = require('../libs/global-variable');  // set global variable. 

class DbBase {
    constructor(req) {
        this.#asyncConstructor(req);
    }

    async #asyncConstructor(req) {
        //console.log('DbBase constructor called');
        //console.log(req.dbconf.mainDB.connectionInfo);
        if (req.dbconf.mainDB.conn) {
            console.log('use exist conn')
            // already connected 
            this.conn = req.dbconf.mainDB.connObj;
        } else {
            console.log('create new conn');
            req.dbconf.mainDB.connObj = await mysql.createConnection(req.dbconf.mainDB.connectionInfo);
            req.dbconf.mainDB.disconn = async () => {
                //console.log('disconnected !!!!');
                try {
                    await req.dbconf.mainDB.connObj.end();
                } catch(err) {
                    console.log('disconn Error');
                }
            }
            req.dbconf.mainDB.conn = true;

            this.conn = req.dbconf.mainDB.connObj;
        }
        //console.log('DbBase constructor done');
    }

    /*
    async query(sql) {
        try {
            console.log('sql simple query function started');

            return new Promise((resolve, reject) => {
                this.conn.query(sql, (err, result) => {
                    if (err) {
                        console.log('reject case');
                        reject(err);
                    } else {
                        console.log('resolve case');
                        resolve(result);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }
    */

    async query(sql, data) {
        try {
            console.log('sql query data function started');
            //console.log(this.conn);

            return new Promise((resolve, reject) => {
                this.conn.query(sql, data, (err, result) => {
                    if (err) {
                        console.log('reject case');
                        reject(err);
                    } else {
                        console.log('resolve case');
                        resolve(result);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    }
}

module.exports = DbBase;