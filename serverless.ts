import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'sls-legobot',
  frameworkVersion: '>=3.22.0',
  custom: {
   
  },
  // Add the serverless-bundle plugin
  plugins: ['serverless-bundle','serverless-plugin-log-retention'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'us-east-1'}",
    timeout: 180,
    memorySize: 1024,
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    deploymentBucket: {
      name: "shapediver-serverlessdeploy-${self:provider.region}"
    },
    logRetentionInDays: 30
  },
  functions: {
    process: {
      handler: 'src/handlers/handler.process',
      events: [
        {
          eventBridge: {
            schedule: "rate(5 minutes)"
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
