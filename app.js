var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// add ... 
var favicon = require('serve-favicon'); // favicon. 
var interceptor = require('express-interceptor'); // middle ware. 

// Error ... 
var CustomError = require('./libs/custom-error'); // set Custom Error.
var CustomErrorCode = require('./libs/custom-error-code');  // set custom error code. 
var GlobalVar = require('./libs/global-variable');  // set global variable. 
var ErrorController = require('./controllers/error-controller') // error controllers.


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set("etag", false);     // 304 reponse 회피. etag 막음.

// middleware set. 
// 일반적인 json response 가 아니면 오류처리.
// json response 에 err_code 가 없으면 오류처리.
var finalParagraphInterceptor = interceptor(function(req, res){
    return {
        // Only HTML responses will be intercepted
        isInterceptable: function(){
            return /json|html/.test(res.get('Content-Type'));
            //return true;  // 항상 인터셉트 ! 
        },

        // Appends a paragraph at the end of the response body
        // 명심하자 .. send 값은 String이다.. !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
        intercept: async function(body, send) {
            try {
                console.log('인터셉트 되었네요...');

                parseBody = JSON.parse( body );
                //console.log(parseBody);

                parseBody.err_code = parseBody.err_code ?? 0;
                parseBody.err_message = parseBody.err_message ?? 'success';

                newBody = JSON.stringify(parseBody);
    
                //res.set('Content-Type', 'application/json');
                //send(JSON.stringify({json: body}));
                send(newBody);
            } catch ( err ) {
                //res.set('Content-Type', 'application/json');
                // parsing 오류로 판단하여, json 으로 만든다음에 다시 메시지를 보낸다. 
                try {
                    var myErrorController = new ErrorController(req);
                    await myErrorController.setParseError(req, res, body);
                } catch (err2) {
                    // ignore error.
                }

                var responseErr = {
                    err_code: CustomErrorCode.INVALID_JSON,
                    err_message: 'Invalid Json'
                }
                newBody = JSON.stringify(responseErr);

                res.status(500);
                send(newBody);
            }
        },

        // intercept에서, send 까지 처리되어야.. 얘가 호출된다.
        afterSend: function(oldBody,newBody) {
            console.log('afterSend Called');
            try {
                if ( req.dbconf.mainDB.conn ) {
                    console.log('DISCONNECT !!!!');
                    req.dbconf.mainDB.disconn();    // if connection is occurred, disconnect it. 
                }
            } catch (error) {
                // 혹시나 해서 안전장치 ... 
                console.log('exception in interceptor.afterSend()');
                console.log(error);
            }
        }
    };
})

app.use(finalParagraphInterceptor);   // 인터셉터 등록. 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// req 변수에 database 관련 정보를 추가하기 위한 middle ware. 
app.use( (req,res,next) => {
    console.log('req param set.');
    req.dbconf = {
        mainDB: {
            connectionInfo: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                //connectTimeout: 4000, // 연결 제한 시간 설정 (4초)
                //waitForConnections: true,
            },
            conn: false,
            connObj : null,
            disconn : null
        }
    }
    next();
});

app.use('', indexRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    //next(createError(404));
    //res.status(404).send('낫 파운드')

    // HTTP 상태 코드 변경
    //res.statusCode = 404; // 상태 코드 404
    //throw new CustomError( '404 낫 Found', CustomErrorCode.URL_NOT_FOUND, 404 );
    throw new CustomError( '404 Not Found', CustomErrorCode.URL_NOT_FOUND, 404 );
});

// error handler
app.use(function(err, req, res, next) {
    console.log('this is error handler');
    console.log(err);

    var myErrorController = new ErrorController(req);
    myErrorController.setError(req, res, err).catch(next);

    /*
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
    */
});

module.exports = app;   // hander.js 로 전달하기 위한 선언. 
