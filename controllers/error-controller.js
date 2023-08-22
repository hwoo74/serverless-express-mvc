
// Controller 는 Static 으로 ... 
// constructor 는 없는걸로 ... 

require('dotenv').config();

const ErrorModel = require("../models/error-model.js");
const CustomErrorCode = require('../libs/custom-error-code');  // set custom error code. 

class ErrorController {

    constructor() {
        //console.log('ErrorController Created');
        // database 연결시점에서, express 의 req 항목을 이용하므로, constructor 를 사용하지 않고 진행한다.
    }

    async getErrorModel(req) {
        // nothing to do. (static function base.)
        if ( this.errorModel ) return this.errorModel;

        this.errorModel = await new ErrorModel(req);
        return this.errorModel;
    }

    async setError(req, res, err) {
        // 모델을 매번 로딩해서 쓰는 방식으로, 내부적으로 connection을 재활용하기위한 방법이다. 
        var myErrorModel = await this.getErrorModel(req);

        var uid = req.uid ?? 0;
        var error_code = err.errorCode ?? 0;
        var error_msg = err.debugMsg || err.errorMsg;

        const no_error_log_status = [404];

        console.log('inside set Error ')
        console.log(err);

        var erridx = no_error_log_status.indexOf(err.statusCode);
        if (erridx !== -1) {
            // 주어진 status 범위에 있으면 로그를 남기지 않음.
        } else {
            // no_error_log_status 에 속하지 않을때만 DB에 기록을 남긴다.
            await myErrorModel.setError(uid, error_code, error_msg);
        } 

        var responseErr = {
            err_code: err.errorCode,
            err_message: err.errorMsg
        }
        //console.log(responseErr);

        res.status(err.statusCode || 500);
        res.send(responseErr);
    }

    async setParseError(req, res, body) {
        // 모델을 매번 로딩해서 쓰는 방식으로, 내부적으로 connection을 재활용하기위한 방법이다. 
        var myErrorModel = await this.getErrorModel(req);
        var uid = req.uid ?? 0;

        await myErrorModel.setError(uid, CustomErrorCode.INVALID_JSON, body);

        //res.status(500);
        //res.send(responseErr);
        return responseErr;
    }
}

module.exports = ErrorController;