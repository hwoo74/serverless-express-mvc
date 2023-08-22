const DbBase = require("./db-base");
const CustomError = require('../libs/custom-error');
const CustomErrorCode = require('../libs/custom-error-code');  // set custom error code. 

class TestModel extends DbBase {
    constructor(req) {
        //console.log('TestModel Created')
        super(req);
        //console.log('TestModel Created Done')
    }

    async getTest() {
        console.log('inside getTest()');
        
        // 강제로 쿼리 오류도 내볼것... 
        var title_str = await this.query("select * from leah_test").then((res) => {
            console.log('ok it worked');
            //console.log(res);
            //console.log(res[0].title);

            return res[0].title;
        }).catch((err) => {
            console.log( 'dberr inside.')
            //console.log( err );
            //console.log( err.sqlMessage );
            //throw new Error(err);
            throw new CustomError( 'database Read Error in getTest()', CustomErrorCode.QUERY_SELECT_ERROR, 500, err.sqlMessage );
        });
    
        return title_str;
    }
}

module.exports = TestModel;