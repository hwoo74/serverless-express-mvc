<!--
title: 'Serverless Framework Node Express API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API on AWS

This template demonstrates how to develop and deploy a simple Node Express API service running on AWS Lambda using the traditional Serverless Framework.

## Anatomy of the template

This template configures a single function, `api`, which is responsible for handling all incoming requests thanks to the `httpApi` event. To learn more about `httpApi` event configuration options, please refer to [httpApi event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/). As the event is configured in a way to accept all incoming requests, `express` framework is responsible for routing and handling requests internally. Implementation takes advantage of `serverless-http` package, which allows you to wrap existing `express` applications. To learn more about `serverless-http`, please refer to corresponding [GitHub repository](https://github.com/dougmoscrop/serverless-http).

## Usage

### Deployment

Install dependencies with:

```
npm install
```

and then deploy with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-express-api-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-express-api-project-dev (196s)

endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
functions:
  api: aws-node-express-api-project-dev-api (766 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [`httpApi` event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in the following response:

```
{"message":"Hello from root!"}
```

Calling the `/hello` path with:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/hello
```

Should result in the following response:

```bash
{"message":"Hello from path!"}
```

If you try to invoke a path or method that does not have a configured handler, e.g. with:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/nonexistent
```

You should receive the following response:

```bash
{"error":"Not Found"}
```

### Local development

It is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).


### 주절주절 ... 구조. 

1. Express 와 serverless / serverless-offline 을 연계해서 진행하기 위한 구조. 
- npm start 시 ... node ./bin/www 를 호출함. 
  - 해당 파일의 역활은 내부에서 app.js 를 호출하고, http server socket 을 생성하는 역활. 
- serverless 로 실행시 .
  - 도커에서 돌릴때는 명령어 복잡. 옵션 더 줘야함. 
    - sls offline --host 0.0.0.0 --disableCookieValidation
  - 메인은 serverless.yml 에서 handler.js 를 호출해 주는것. 
  - handler.js 에서는 메인이 되는 app.js 를 호출하여 실행시킴. 
- 두개의 동작은 원칙적으로 같아야 함. 

2. app.js 구조. 
- favicon 등록하고, 
- express-interceptor 를 사용해서 오류 케이스를 걸러냄. 
  - Content-type 이 json이나 html 에 한하여 작동.
  - Parsing 오류 (json이 아닌경우) 에 한하여 오류처리. 
    - error-controller 를 통하여 error-model 을 통해 디비에 오류 내역을 남김. 
  - response 가 끝난후, DB connection 이 있었으면 .. connection 을 끊어버리고 종료. 
- 유져별 connection 처리는 광역변수로 처리할 수 없음.
  - 따라서 middleware 를 두고, middleware 에서 req 항목에 connection 관련 변수를 넘김.
  - 유저 접속시 콘넥션 생성해서, 해당 컨넥션으로 처리한 뒤에, 컨넥션을 종료하기위해선 seq 항목으로 처리해야 함. 
- router에 체크되지 않는 경로는 맨 마지막 app.use 로 처리됨.
  - 이곳이 404 error를 처리하는 곳.
- Custom error Class를 정의해서 사용.
- 마지막 error_handler 를 통해 custom error controller 를 호출해서 오류에 따른 형태를 재정의. 

3. Controller 
- model을 호출해서 처리하는 방식의 구조. 
  - model의 parent class 에서 database connection 관리가 진행되는 구조. 
  - 파라메터 req 가 반드시 필요하도록 설계함 ... 
- 유저별 connection 관리를 express의 req 파라메터로 처리하므로, constructor 를 쓰지 않고 진행함. 
  - 실 함수가 호출될때, req 변수가 전달되므로, 이 req변수를 이용해 model을 호출해야 함. 
