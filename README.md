# ServerLessExamples - TwitterBot

Example for serverless function - A Twitter Bot calling a ShapeDiver Model

Please see [src/geometry-backend/modelutil.ts](src/geometry-backend/modelutil.ts) regarding assumptions for the ShapeDiver Model.

# Setup

## Install Serverless Framework

https://www.serverless.com/framework/docs/getting-started#via-npm

```
npm install -g serverless
```

## Install dependencies

```
npm install
```

## Create config.ts from config.ts.template

You will need API keys etc for Twitter, as well as a backend ticket and model view url for your ShapeDiver model.

## Test locally

```
npm run local
```

## Deploy to AWS

This example is configured to deploy to AWS, which can be changed, see [serverless providers](https://www.serverless.com/framework/docs/providers).

You will need an AWS account and access keys which provide you with sufficient privileges for quite some stuff (the given configration for the serverless framework uses AWS CloudFormation). 
The scripts in `package.json` assume that your AWS credentials are stored using profile name `serverless_cli`. 

```
npm run sls deploy
```

## Watch what's going on in CloudWatch Logs

```
npm run logs
```
