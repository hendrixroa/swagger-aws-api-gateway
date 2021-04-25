import * as SwaggerParser from "@apidevtools/swagger-parser";

export class APIGatewayIntegrator {
  private readonly apiSpec: any;

  constructor(apiSpec: any) {
    this.apiSpec = apiSpec;
  }

  public async addIntegration(): Promise<any> {
    let apiSpecMutable: any = await this.validateOpenapiSpec();

    for (const path in apiSpecMutable.paths) {
      for (const method in apiSpecMutable.paths[path]) {
        const objIntegration = this.addIntegrationObject(apiSpecMutable.paths[path][method], method, path);
        apiSpecMutable.paths[path][method][
          'x-amazon-apigateway-integration'
          ] = objIntegration;
        apiSpecMutable.paths[path].options = this.addIntegrationCORS();
      }
    }
    return apiSpecMutable;
  }

  public async validateOpenapiSpec(): Promise<any> {
    try {
      await SwaggerParser.validate(this.apiSpec);
      return await SwaggerParser.bundle(this.apiSpec);
    } catch (err) {
      throw new Error('Invalid api spec: ' + err);
    }
  }

  private addIntegrationObject(currentObjectMethod: any, method: string, path: string): any {
    let awsIntegration: any = this.getAWSIntegrationObject(method, path);
    const produces = currentObjectMethod.produces;
    if (
      produces &&
      Array.isArray(produces) &&
      produces.includes('image/png')
    ) {
      awsIntegration.contentHandling = 'CONVERT_TO_BINARY';
    }
    if (path.includes('{')) {
      awsIntegration.requestParameters = this.createRequestParams(path);
    }
    return awsIntegration;
  }

  private getAWSIntegrationObject(method: string, path: string) {
    return {
      connectionId: '${stageVariables.vpcLinkId}',
      connectionType: 'VPC_LINK',
      httpMethod: `${method.toUpperCase()}`,
      passthroughBehavior: 'when_no_match',
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
      responses: {
        default: {
          responseTemplates: {
            'application/json': '{"statusCode": 200}',
          },
          statusCode: '200',
        },
      },
      type: 'http_proxy',
      uri:
        'http://${stageVariables.nlbDnsName}:${stageVariables.port}' + path,
    };
  }

  private createRequestParams(path: string): any {
    let requestParams: any = {};
    const matches = path.match(/{(.*?)}/g) || [];
    for (const param of matches) {
      const item = param.replace(/({|})/g, '');
      requestParams[
        `integration.request.path.${item}`
        ] = `method.request.path.${item}`;
    }
    return requestParams;
  }

  private addIntegrationCORS() {
    return {
      description: 'Enable CORS by returning correct headers\n',
      responses: {
        200: {
          description: 'Default response for CORS method',
          headers: {
            'Access-Control-Allow-Headers': {
              schema: {
                type: 'string',
              },
            },
            'Access-Control-Allow-Methods': {
              schema: {
                type: 'string',
              },
            },
            'Access-Control-Allow-Origin': {
              schema: {
                type: 'string',
              },
            },
          },
          content: {},
        },
      },
      summary: 'CORS support',
      tags: ['CORS'],
      'x-amazon-apigateway-integration': {
        requestTemplates: {
          'application/json': '{\n  "statusCode" : 200\n}\n',
        },
        responses: {
          default: {
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers':
                "'*'",
              'method.response.header.Access-Control-Allow-Methods': "'*'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
            responseTemplates: {
              'application/json': '{}\n',
            },
            statusCode: '200',
          },
        },
        type: 'mock',
      },
    };
  }
}