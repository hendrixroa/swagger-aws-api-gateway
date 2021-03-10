# Swagger AWS API Gateway

Small library to add AWS API Gateway integration to your swagger/openapi specification. Boring to have dealing with API Gateway integrations like `x-amazon-apigateway-integration` (see AWS docs [API GW Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-integration.html)) on your swagger file specification?, this small package is for you 😉.

## How to install

```bash
npm i swagger-aws-api-gateway # or
yarn add swagger-aws-api-gateway
```

### How to use

```javascript
const awsIntegration = require('swagger-aws-api-gateway');
const swaggerJSONData = {}; // your swagger valid json data;
const swaggerWithIntegrations = awsIntegration.addIntegration(swaggerJSONData);
console.log('Result: ', swaggerWithIntegrations);
```

### Limitations
- This library is thinking only for API Rest with VPC link integrations and port mappings deployment running on AWS ECS/EC2/K8, check more here [API GW VPC Link integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vpc-links.html)
- When you creates the [API Gateway deployment](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-deploy-api.html) you should to add this environment variables:

```text
vpcLinkId -> Vpc link id
nlbDnsName -> Dns name of load balancer provisioned
port       -> Api port of you service running
```
~~- This module (For now) is not validating if a swagger spec has the right format, please be aware of that.~~