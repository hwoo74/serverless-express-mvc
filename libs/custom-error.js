class CustomError extends Error {
    constructor(message, errorCode, statusCode, debugMsg) {
        super(message);
        
        this.name = this.constructor.name;
        this.errorCode = errorCode || 9001;         // errorCode for internal 
        this.errorMsg = message || 'Internal Server Error'; // errorMsg for internal 
        this.statusCode = statusCode || 500;        // http return status code.
        this.debugMsg = debugMsg || message;        // message for server debug.

        // Node.js에서 제공하는 메서드로, 에러 객체의 스택 트레이스를 캡처하고 설정하는데 사용됩니다. 
        // 스택 트레이스는 코드의 실행 경로와 함수 호출 관계를 나타내며, 디버깅과 에러 추적에 유용하게 활용됩니다.
        /**
         *  try {
                throw new CustomError('Custom error message');
            } catch (error) {
                console.error(error.stack); // 스택 트레이스 출력
            }
         */
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = CustomError;