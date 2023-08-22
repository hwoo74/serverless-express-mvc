const DbBase = require("./db-base");
const CustomError = require('../libs/custom-error');
const CustomErrorCode = require('../libs/custom-error-code');  // set custom error code. 

//class ErrorModel {
class ErrorModel extends DbBase {
    constructor(req) {
        super(req);
    }

    async setError(uid, error_code, error_msg) {
        await this.query("insert into leah_errlog ( uid, error_code, error_msg ) values ( ?, ?, ? )", [uid, error_code, error_msg]).then((res) => {
            console.log('ok error log saved');
        }).catch((err) => {
            // ignore error.
            console.log(err);
            console.log({
                uid: uid,
                error_code: error_code,
                error_msg: error_msg,
            });
            console.log('error log save error.');
        });
    }
}

module.exports = ErrorModel;