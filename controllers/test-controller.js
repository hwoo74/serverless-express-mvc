
// Controller 는 Static 으로 ... 
// constructor 는 없는걸로 ... 

require('dotenv').config();

const TestModel = require("../models/test-model.js");

class TestController {

    constructor() {
        // console.log('TestController Created');
        // database 연결시점에서, express 의 req 항목을 이용하므로, constructor 를 사용하지 않고 진행한다.
    }

    async getTestModel(req) {
        // nothing to do. (static function base.)
        if ( this.testModel ) return this.testModel;
        
        this.testModel = await new TestModel(req);
        return this.testModel;
    }

    async getUser(req, res) {
        // 모델을 매번 로딩해서 쓰는 방식으로, 내부적으로 connection을 재활용하기위한 방법이다. 
        var myTestModel = await this.getTestModel(req);
        //console.log(myTestModel);
        //console.log(req.params.user);

        var result = {
            user: req.params.user,
            message: 'success',
            test_name: await myTestModel.getTest() || null  // undefined 오류의 경우 변수 값 자체가 전달되지 않음. 이경우 null로 채워 보내기위한 장치.
        }

        console.log( result );

        res.send( result );
        //res.send( 'result is result hahahaha' );    // json 이 아닌 다른 문자열이 발생했을때의 Error 강제 발생 테스트.
    }
}

module.exports = TestController;

/*  
async function boo(param) {
    try {
        testModel = new TestModel();

        var testName = await testModel.getTest();
        console.log('return name is ' + testName);

        return param + '#fromBoo#' + testName;
    } catch (err) {
        console.log(err);
        return param + '#error#';
    }
}

exports.default = boo;
*/